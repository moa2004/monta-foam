import bcrypt from "bcryptjs";
import { Hono, type Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { secureHeaders } from "hono/secure-headers";
import { clearAuthCookies, digest, issueTokens, optionalAuth, requireAuth, requireRole, setAuthCookies, verifyRefresh } from "./auth";
import { asBoolean, ensureDatabase, mapNotification, mapProject, mapRequest, mapService, mapUser } from "./db";
import { sendOtpEmail } from "./email";
import type { AppEnv, AuthUser, Role, Variables } from "./types";

type HonoEnv = { Bindings: AppEnv; Variables: Variables };
type ApiContext = Context<HonoEnv>;
type Row = Record<string, unknown>;
class ApiError extends Error {
  constructor(message: string, readonly status: 400|401|403|404|409|503 = 400, readonly code = "BAD_REQUEST") { super(message); }
}
export const api = new Hono<HonoEnv>();
api.use("*", secureHeaders());
api.use("/api/v1/*", async (c, next) => { await ensureDatabase(c.env); await next(); });
api.onError((error, c) => error instanceof ApiError
  ? c.json({ success: false, message: error.message, code: error.code }, error.status)
  : (console.error("Unhandled API error", error), c.json({ success: false, message: "An unexpected error occurred", code: "INTERNAL_ERROR" }, 500)));

const nowIso = () => new Date().toISOString();
const normalizeEmail = (v: unknown) => String(v ?? "").trim().toLowerCase();
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const strongPassword = (v: string) => v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v);
const randomCode = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
const randomHex = (n: number) => [...crypto.getRandomValues(new Uint8Array(n))].map((v) => v.toString(16).padStart(2, "0")).join("");
const cleanImage = (value: unknown, required = false): string | null => {
  const image = String(value ?? "").trim();
  if (!image) {
    if (required) throw new ApiError("An image is required", 400, "IMAGE_REQUIRED");
    return null;
  }
  if (image.length > 1_850_000) throw new ApiError("Image is too large", 400, "IMAGE_TOO_LARGE");
  const isLocal = /^\/(?!\/)[^\s]+$/.test(image);
  const isRemote = /^https?:\/\/[^\s]+$/i.test(image);
  const isUploaded = /^data:image\/(?:jpeg|png|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(image);
  if (!isLocal && !isRemote && !isUploaded) throw new ApiError("Image must be an uploaded file or a valid URL", 400, "INVALID_IMAGE");
  return image;
};
const cleanLink = (value: unknown): string | null => {
  const link = String(value ?? "").trim();
  if (!link) return null;
  if (!/^https?:\/\/[^\s]+$/i.test(link) || link.length > 1000) throw new ApiError("Project link is invalid", 400, "INVALID_LINK");
  return link;
};
async function body(c: ApiContext): Promise<Row> {
  try { const v = await c.req.json(); if (!v || typeof v !== "object" || Array.isArray(v)) throw 0; return v as Row; }
  catch { throw new ApiError("Request body must be valid JSON", 400, "INVALID_JSON"); }
}
const findUser = (env: AppEnv, id: string) => env.DB.prepare("SELECT * FROM users WHERE id=?").bind(id).first<Row>();
async function audit(env: AppEnv, action: string, actorId?: string, metadata?: Row) {
  await env.DB.prepare("INSERT INTO audit_logs (id,action,actor_id,metadata,created_at) VALUES (?,?,?,?,?)")
    .bind(crypto.randomUUID(), action, actorId || null, metadata ? JSON.stringify(metadata) : null, nowIso()).run();
}
async function notifyAdmins(env: AppEnv, title: string, message: string, type: string, metadata?: Row) {
  const admins = await env.DB.prepare("SELECT id FROM users WHERE role IN ('ADMIN','MASTER_ADMIN') AND is_suspended=0").all<{id:string}>();
  if (!admins.results.length) return;
  const created = nowIso();
  await env.DB.batch(admins.results.map((a: { id: string }) => env.DB.prepare(
    "INSERT INTO notifications (id,user_id,title,message,type,metadata,is_read,created_at) VALUES (?,?,?,?,?,?,0,?)",
  ).bind(crypto.randomUUID(), a.id, title, message, type, metadata ? JSON.stringify(metadata) : null, created)));
}
async function completeLogin(c: ApiContext, row: Row) {
  const user: AuthUser = { id: String(row.id), role: String(row.role) as Role, isVerified: asBoolean(row.is_verified) };
  const tokens = await issueTokens(c.env, user);
  await c.env.DB.prepare("UPDATE users SET refresh_token_hash=?,updated_at=? WHERE id=?")
    .bind(await digest(tokens.refreshToken), nowIso(), user.id).run();
  setAuthCookies(c, tokens.accessToken, tokens.refreshToken);
  return { accessToken: tokens.accessToken, user: mapUser(row) };
}
async function createOtp(env: AppEnv, user: Row, purpose: "EMAIL_VERIFICATION"|"PASSWORD_RESET") {
  await env.DB.prepare("UPDATE otps SET consumed=1 WHERE user_id=? AND purpose=? AND consumed=0").bind(user.id, purpose).run();
  const code = randomCode();
  await env.DB.prepare("INSERT INTO otps (id,user_id,code,purpose,expires_at,consumed,created_at) VALUES (?,?,?,?,?,0,?)")
    .bind(crypto.randomUUID(), user.id, await digest(code), purpose, new Date(Date.now()+600000).toISOString(), nowIso()).run();
  await sendOtpEmail(env, String(user.email), String(user.full_name), code, purpose);
}

api.get("/api/v1/health", (c) => c.json({ success: true, message: "API is healthy", timestamp: nowIso() }));

api.post("/api/v1/auth/register", async (c) => {
  const input = await body(c); const fullName = String(input.fullName ?? "").trim();
  const email = normalizeEmail(input.email); const password = String(input.password ?? "");
  if (fullName.length < 2 || fullName.length > 100) throw new ApiError("Full name must be between 2 and 100 characters");
  if (!isEmail(email)) throw new ApiError("Invalid email address");
  if (!strongPassword(password)) throw new ApiError("Password does not meet security requirements");
  if (await c.env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first()) throw new ApiError("An account with this email already exists",409,"EMAIL_TAKEN");
  const id=crypto.randomUUID(), now=nowIso();
  await c.env.DB.prepare("INSERT INTO users (id,full_name,email,password,role,is_verified,is_suspended,provider,created_at,updated_at) VALUES (?,?,?,?,'USER',0,0,'LOCAL',?,?)")
    .bind(id, fullName, email, await bcrypt.hash(password,12), now, now).run();
  const user=await findUser(c.env,id); if(!user) throw new Error("Created user missing");
  try {
    await createOtp(c.env,user,"EMAIL_VERIFICATION");
  } catch (error) {
    await c.env.DB.prepare("DELETE FROM users WHERE id=?").bind(id).run();
    throw error;
  }
  await Promise.all([audit(c.env,"REGISTER",id),notifyAdmins(c.env,"New user registered",`${fullName} (${email}) has created an account.`,"NEW_USER",{userId:id})]);
  return c.json({success:true,message:"Registration successful. Check your email for the verification code.",data:{userId:id}},201);
});
api.post("/api/v1/auth/verify-email", async(c)=>{
  const input=await body(c), email=normalizeEmail(input.email), code=String(input.code??"").trim();
  const user=await c.env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first<Row>();
  if(!user) throw new ApiError("No account found with this email",404,"USER_NOT_FOUND");
  if(asBoolean(user.is_verified)) throw new ApiError("Email is already verified",409,"ALREADY_VERIFIED");
  const otp=await c.env.DB.prepare("SELECT * FROM otps WHERE user_id=? AND purpose='EMAIL_VERIFICATION' AND consumed=0 AND expires_at>? ORDER BY created_at DESC LIMIT 1").bind(user.id,nowIso()).first<Row>();
  if(!otp || await digest(code)!==otp.code) throw new ApiError("OTP is invalid or has expired",400,"OTP_INVALID");
  await c.env.DB.batch([c.env.DB.prepare("UPDATE otps SET consumed=1 WHERE id=?").bind(otp.id),c.env.DB.prepare("UPDATE users SET is_verified=1,updated_at=? WHERE id=?").bind(nowIso(),user.id)]);
  user.is_verified=1; const data=await completeLogin(c,user); await audit(c.env,"EMAIL_VERIFIED",String(user.id));
  return c.json({success:true,message:"Email verified successfully.",data});
});
api.post("/api/v1/auth/resend-otp",async(c)=>{
  const input=await body(c),email=normalizeEmail(input.email); const user=await c.env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first<Row>();
  if(!user) throw new ApiError("No account found with this email",404,"USER_NOT_FOUND");
  if(asBoolean(user.is_verified)) throw new ApiError("Email is already verified",409,"ALREADY_VERIFIED");
  await createOtp(c.env,user,"EMAIL_VERIFICATION"); return c.json({success:true,message:"Verification code resent. Check your email."});
});
api.post("/api/v1/auth/login",async(c)=>{
  const input=await body(c),email=normalizeEmail(input.email),password=String(input.password??"");
  const user=await c.env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first<Row>();
  if(!user||!user.password||!await bcrypt.compare(password,String(user.password))){await audit(c.env,"LOGIN_FAILED",user?String(user.id):undefined,{email});throw new ApiError("Invalid email or password",401,"INVALID_CREDENTIALS");}
  if(asBoolean(user.is_suspended)) throw new ApiError("This account has been suspended",403,"ACCOUNT_SUSPENDED");
  const data=await completeLogin(c,user);await audit(c.env,"LOGIN_SUCCESS",String(user.id));return c.json({success:true,message:"Logged in successfully.",data});
});
api.post("/api/v1/auth/refresh",async(c)=>{
  const token=getCookie(c,"refreshToken");if(!token)throw new ApiError("Refresh token missing",401,"NO_REFRESH_TOKEN");
  let id:string;try{id=await verifyRefresh(c.env,token);}catch{throw new ApiError("Invalid or expired refresh token",401,"INVALID_REFRESH_TOKEN");}
  const user=await findUser(c.env,id);if(!user||!user.refresh_token_hash)throw new ApiError("Session not found",401,"SESSION_NOT_FOUND");
  if(asBoolean(user.is_suspended))throw new ApiError("Account suspended",403,"ACCOUNT_SUSPENDED");
  if(String(user.refresh_token_hash)!==await digest(token)){await c.env.DB.prepare("UPDATE users SET refresh_token_hash=NULL WHERE id=?").bind(id).run();throw new ApiError("Refresh token reuse detected. Please log in again.",401,"TOKEN_REUSE_DETECTED");}
  const data=await completeLogin(c,user);return c.json({success:true,message:"Tokens refreshed.",data:{accessToken:data.accessToken}});
});
api.post("/api/v1/auth/logout",requireAuth,async(c)=>{const id=c.get("user").id;await c.env.DB.prepare("UPDATE users SET refresh_token_hash=NULL WHERE id=?").bind(id).run();clearAuthCookies(c);await audit(c.env,"LOGOUT",id);return c.json({success:true,message:"Logged out successfully."});});
api.get("/api/v1/auth/me",requireAuth,async(c)=>{const user=await findUser(c.env,c.get("user").id);if(!user||asBoolean(user.is_suspended))throw new ApiError("User not found",401,"UNAUTHORIZED");return c.json({success:true,data:mapUser(user)});});
api.post("/api/v1/auth/forgot-password",async(c)=>{const input=await body(c),email=normalizeEmail(input.email);const user=await c.env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first<Row>();if(user&&user.provider!=="GOOGLE"){await createOtp(c.env,user,"PASSWORD_RESET");await audit(c.env,"PASSWORD_RESET_REQUESTED",String(user.id));}return c.json({success:true,message:"If this email exists, a reset code has been sent."});});
api.post("/api/v1/auth/reset-password",async(c)=>{const input=await body(c),email=normalizeEmail(input.email),code=String(input.code??""),password=String(input.newPassword??"");if(!strongPassword(password))throw new ApiError("Password does not meet security requirements");const user=await c.env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first<Row>();if(!user)throw new ApiError("No account found with this email",404,"USER_NOT_FOUND");if(user.provider==="GOOGLE")throw new ApiError("Google accounts cannot reset passwords here",400,"GOOGLE_ACCOUNT");const otp=await c.env.DB.prepare("SELECT * FROM otps WHERE user_id=? AND purpose='PASSWORD_RESET' AND consumed=0 AND expires_at>? ORDER BY created_at DESC LIMIT 1").bind(user.id,nowIso()).first<Row>();if(!otp||await digest(code)!==otp.code)throw new ApiError("OTP is invalid or has expired",400,"OTP_INVALID");await c.env.DB.batch([c.env.DB.prepare("UPDATE otps SET consumed=1 WHERE id=?").bind(otp.id),c.env.DB.prepare("UPDATE users SET password=?,refresh_token_hash=NULL,updated_at=? WHERE id=?").bind(await bcrypt.hash(password,12),nowIso(),user.id)]);return c.json({success:true,message:"Password reset successfully. Please log in again."});});

api.get("/api/v1/auth/google/start",async(c)=>{
  if(!c.env.GOOGLE_CLIENT_ID||!c.env.GOOGLE_CLIENT_SECRET)throw new ApiError("Google sign-in is not configured",503,"GOOGLE_NOT_CONFIGURED");
  const state=randomHex(32),secure=new URL(c.req.url).protocol==="https:";setCookie(c,"googleOAuthState",state,{httpOnly:true,secure,sameSite:"Lax",path:"/api/v1/auth/google",maxAge:600});
  const callback=c.env.GOOGLE_CALLBACK_URL||new URL("/api/v1/auth/google/callback",c.req.url).toString();const url=new URL("https://accounts.google.com/o/oauth2/v2/auth");
  Object.entries({client_id:c.env.GOOGLE_CLIENT_ID,redirect_uri:callback,response_type:"code",scope:"openid email profile",state,access_type:"online",prompt:"select_account"}).forEach(([k,v])=>url.searchParams.set(k,v));return c.redirect(url.toString());
});
api.get("/api/v1/auth/google/callback",async(c)=>{
  const target=new URL("/auth/google/callback",c.req.url),state=c.req.query("state")||"",stored=getCookie(c,"googleOAuthState")||"";deleteCookie(c,"googleOAuthState",{path:"/api/v1/auth/google"});
  if(c.req.query("error")){target.searchParams.set("error","access_denied");return c.redirect(target.toString());}
  const code=c.req.query("code")||"";if(!code||!state||!stored||state!==stored){target.searchParams.set("error","invalid_state");return c.redirect(target.toString());}
  try{
    if(!c.env.GOOGLE_CLIENT_ID||!c.env.GOOGLE_CLIENT_SECRET)throw 0;const callback=c.env.GOOGLE_CALLBACK_URL||new URL("/api/v1/auth/google/callback",c.req.url).toString();
    const tr=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:c.env.GOOGLE_CLIENT_ID,client_secret:c.env.GOOGLE_CLIENT_SECRET,redirect_uri:callback,grant_type:"authorization_code"})});
    if(!tr.ok)throw new Error(`token ${tr.status}`);const tokens=await tr.json() as {access_token?:string};if(!tokens.access_token)throw 0;
    const pr=await fetch("https://openidconnect.googleapis.com/v1/userinfo",{headers:{Authorization:`Bearer ${tokens.access_token}`}});if(!pr.ok)throw 0;
    const p=await pr.json() as {sub?:string;email?:string;email_verified?:boolean;name?:string;picture?:string};if(!p.sub||!p.email||!p.email_verified)throw 0;const email=normalizeEmail(p.email);
    let user=await c.env.DB.prepare("SELECT * FROM users WHERE google_id=? OR email=? LIMIT 1").bind(p.sub,email).first<Row>();
    if(user&&asBoolean(user.is_suspended)){target.searchParams.set("error","account_suspended");return c.redirect(target.toString());}
    if(user&&user.role==="MASTER_ADMIN"&&user.provider==="LOCAL"){target.searchParams.set("error","password_login_required");return c.redirect(target.toString());}
    if(!user){const id=crypto.randomUUID(),now=nowIso();await c.env.DB.prepare("INSERT INTO users (id,full_name,email,password,role,is_verified,is_suspended,avatar,provider,google_id,created_at,updated_at) VALUES (?,?,?,NULL,'USER',1,0,?,'GOOGLE',?,?,?)").bind(id,p.name||email.split("@")[0],email,p.picture||null,p.sub,now,now).run();user=await findUser(c.env,id);await notifyAdmins(c.env,"New user registered via Google",`${p.name||email} (${email}) signed in with Google.`,"NEW_USER",{userId:id});}
    else if(!user.google_id){await c.env.DB.prepare("UPDATE users SET google_id=?,is_verified=1,avatar=COALESCE(?,avatar),updated_at=? WHERE id=?").bind(p.sub,p.picture||null,nowIso(),user.id).run();user=await findUser(c.env,String(user.id));}
    if(!user)throw 0;await completeLogin(c,user);await audit(c.env,"GOOGLE_LOGIN",String(user.id));target.searchParams.set("status","success");return c.redirect(target.toString());
  }catch(error){console.warn("Google OAuth callback failed",error);target.searchParams.set("error","oauth_failed");return c.redirect(target.toString());}
});

// Services
api.get("/api/v1/services",async(c)=>{const rows=await c.env.DB.prepare("SELECT * FROM services WHERE is_active=1 ORDER BY created_at").all<Row>();return c.json({success:true,data:rows.results.map(mapService)});});
api.get("/api/v1/services/admin/all",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{const rows=await c.env.DB.prepare("SELECT * FROM services ORDER BY created_at").all<Row>();return c.json({success:true,data:rows.results.map(mapService)});});
api.get("/api/v1/services/:id",async(c)=>{const id=c.req.param("id"),row=await c.env.DB.prepare("SELECT * FROM services WHERE (id=? OR slug=?) AND is_active=1 LIMIT 1").bind(id,id).first<Row>();if(!row)throw new ApiError("Service not found",404,"SERVICE_NOT_FOUND");return c.json({success:true,data:mapService(row)});});
const slugify=(v:string)=>v.normalize("NFKD").toLowerCase().trim().replace(/\s+/g,"-").replace(/[^\p{L}\p{N}-]+/gu,"").replace(/-+/g,"-").replace(/(^-|-$)/g,"");
api.post("/api/v1/services",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{const i=await body(c),title=String(i.title??"").trim(),description=String(i.description??"").trim(),image=cleanImage(i.image);if(title.length<2||title.length>120||description.length<10||description.length>1000)throw new ApiError("Invalid service details");const id=crypto.randomUUID(),now=nowIso();try{await c.env.DB.prepare("INSERT INTO services (id,title,slug,description,image,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)").bind(id,title,slugify(title),description,image,i.isActive===false?0:1,now,now).run();}catch{throw new ApiError("A service with a similar title already exists",409,"SLUG_CONFLICT");}await audit(c.env,"SERVICE_CREATED",c.get("user").id,{serviceId:id});const row=await c.env.DB.prepare("SELECT * FROM services WHERE id=?").bind(id).first<Row>();return c.json({success:true,message:"Service created.",data:row?mapService(row):null},201);});
api.patch("/api/v1/services/:id",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{const old=await c.env.DB.prepare("SELECT * FROM services WHERE id=?").bind(c.req.param("id")).first<Row>();if(!old)throw new ApiError("Service not found",404,"SERVICE_NOT_FOUND");const i=await body(c),title=i.title===undefined?String(old.title):String(i.title).trim(),description=i.description===undefined?String(old.description):String(i.description).trim(),image=i.image===undefined?old.image:cleanImage(i.image);if(title.length<2||title.length>120||description.length<10||description.length>1000)throw new ApiError("Invalid service details");try{await c.env.DB.prepare("UPDATE services SET title=?,slug=?,description=?,image=?,is_active=?,updated_at=? WHERE id=?").bind(title,slugify(title),description,image,i.isActive===undefined?old.is_active:i.isActive?1:0,nowIso(),old.id).run();}catch{throw new ApiError("A service with a similar title already exists",409,"SLUG_CONFLICT");}await audit(c.env,"SERVICE_UPDATED",c.get("user").id,{serviceId:String(old.id)});const row=await c.env.DB.prepare("SELECT * FROM services WHERE id=?").bind(old.id).first<Row>();return c.json({success:true,message:"Service updated.",data:row?mapService(row):null});});
api.delete("/api/v1/services/:id",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{const result=await c.env.DB.prepare("DELETE FROM services WHERE id=?").bind(c.req.param("id")).run();if(!result.meta.changes)throw new ApiError("Service not found",404,"SERVICE_NOT_FOUND");return c.json({success:true,message:"Service deleted."});});

// Projects / latest work
api.get("/api/v1/projects",async(c)=>{const rows=await c.env.DB.prepare("SELECT * FROM projects WHERE is_active=1 ORDER BY sort_order,created_at DESC").all<Row>();return c.json({success:true,data:rows.results.map(mapProject)});});
api.get("/api/v1/projects/admin/all",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{const rows=await c.env.DB.prepare("SELECT * FROM projects ORDER BY sort_order,created_at DESC").all<Row>();return c.json({success:true,data:rows.results.map(mapProject)});});
api.post("/api/v1/projects",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{
  const i=await body(c),title=String(i.title??"").trim(),subtitle=String(i.subtitle??"").trim(),image=cleanImage(i.image,true),imageAlt=String(i.imageAlt??title).trim(),linkUrl=cleanLink(i.linkUrl),sortOrder=Number(i.sortOrder??0);
  if(title.length<2||title.length>120||subtitle.length<2||subtitle.length>240||imageAlt.length<2||imageAlt.length>180||!Number.isInteger(sortOrder)||Math.abs(sortOrder)>9999)throw new ApiError("Invalid project details");
  const id=crypto.randomUUID(),now=nowIso();await c.env.DB.prepare("INSERT INTO projects (id,title,subtitle,image,image_alt,link_url,sort_order,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(id,title,subtitle,image,imageAlt,linkUrl,sortOrder,i.isActive===false?0:1,now,now).run();
  await audit(c.env,"PROJECT_CREATED",c.get("user").id,{projectId:id});const row=await c.env.DB.prepare("SELECT * FROM projects WHERE id=?").bind(id).first<Row>();return c.json({success:true,message:"Project created.",data:row?mapProject(row):null},201);
});
api.patch("/api/v1/projects/:id",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{
  const old=await c.env.DB.prepare("SELECT * FROM projects WHERE id=?").bind(c.req.param("id")).first<Row>();if(!old)throw new ApiError("Project not found",404,"PROJECT_NOT_FOUND");const i=await body(c);
  const title=i.title===undefined?String(old.title):String(i.title).trim(),subtitle=i.subtitle===undefined?String(old.subtitle):String(i.subtitle).trim(),image=i.image===undefined?String(old.image):cleanImage(i.image,true),imageAlt=i.imageAlt===undefined?String(old.image_alt):String(i.imageAlt).trim(),linkUrl=i.linkUrl===undefined?old.link_url:cleanLink(i.linkUrl),sortOrder=i.sortOrder===undefined?Number(old.sort_order):Number(i.sortOrder);
  if(title.length<2||title.length>120||subtitle.length<2||subtitle.length>240||imageAlt.length<2||imageAlt.length>180||!Number.isInteger(sortOrder)||Math.abs(sortOrder)>9999)throw new ApiError("Invalid project details");
  await c.env.DB.prepare("UPDATE projects SET title=?,subtitle=?,image=?,image_alt=?,link_url=?,sort_order=?,is_active=?,updated_at=? WHERE id=?").bind(title,subtitle,image,imageAlt,linkUrl,sortOrder,i.isActive===undefined?old.is_active:i.isActive?1:0,nowIso(),old.id).run();
  await audit(c.env,"PROJECT_UPDATED",c.get("user").id,{projectId:String(old.id)});const row=await c.env.DB.prepare("SELECT * FROM projects WHERE id=?").bind(old.id).first<Row>();return c.json({success:true,message:"Project updated.",data:row?mapProject(row):null});
});
api.delete("/api/v1/projects/:id",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{const id=c.req.param("id"),result=await c.env.DB.prepare("DELETE FROM projects WHERE id=?").bind(id).run();if(!result.meta.changes)throw new ApiError("Project not found",404,"PROJECT_NOT_FOUND");await audit(c.env,"PROJECT_DELETED",c.get("user").id,{projectId:id});return c.json({success:true,message:"Project deleted."});});

// Service requests
api.post("/api/v1/requests",optionalAuth,async(c)=>{
  const i=await body(c),fullName=String(i.fullName??"").trim(),email=normalizeEmail(i.email),phone=String(i.phone??"").trim(),notes=i.notes?String(i.notes).trim().slice(0,1000):null;
  if(fullName.length<2||!isEmail(email)||phone.length<7||phone.length>20)throw new ApiError("Please provide valid contact information");let service:Row|null=null;
  if(i.serviceId){service=await c.env.DB.prepare("SELECT * FROM services WHERE id=? OR slug=? LIMIT 1").bind(i.serviceId,i.serviceId).first<Row>();if(!service)throw new ApiError("Service not found",404,"SERVICE_NOT_FOUND");if(!asBoolean(service.is_active))throw new ApiError("This service is not currently available",400,"SERVICE_INACTIVE");}
  const id=crypto.randomUUID(),now=nowIso(),user=c.get("user");await c.env.DB.prepare("INSERT INTO service_requests (id,user_id,service_id,full_name,email,phone,notes,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'PENDING',?,?)").bind(id,user?.id||null,service?.id||null,fullName,email,phone,notes,now,now).run();
  await Promise.all([notifyAdmins(c.env,"New service request",`${fullName} requested ${service?.title||"a service"}. Phone: ${phone}`,"NEW_REQUEST",{requestId:id}),audit(c.env,"SERVICE_REQUEST_CREATED",user?.id,{requestId:id})]);
  const number=(c.env.WHATSAPP_NUMBER||"201129437175").replace(/\D/g,""),message=`طلب جديد من ${fullName}\nالهاتف: ${phone}\nالخدمة: ${service?.title||"استفسار عام"}${notes?`\nملاحظات: ${notes}`:""}`;
  return c.json({success:true,message:"Request submitted. Our team will contact you shortly.",data:{requestId:id,whatsappLink:`https://wa.me/${number}?text=${encodeURIComponent(message)}`}},201);
});
api.get("/api/v1/requests/me",requireAuth,async(c)=>{const rows=await c.env.DB.prepare("SELECT r.*,s.title service_title FROM service_requests r LEFT JOIN services s ON s.id=r.service_id WHERE r.user_id=? ORDER BY r.created_at DESC").bind(c.get("user").id).all<Row>();return c.json({success:true,data:rows.results.map(mapRequest)});});
api.get("/api/v1/requests",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{
  const page=Math.max(1,Number(c.req.query("page"))||1),limit=Math.min(100,Math.max(1,Number(c.req.query("limit"))||20)),status=c.req.query("status"),search=(c.req.query("search")||"").trim();const clauses:string[]=[],values:unknown[]=[];
  if(status&&["PENDING","IN_PROGRESS","COMPLETED","CANCELLED"].includes(status)){clauses.push("r.status=?");values.push(status);}if(search){clauses.push("(LOWER(r.full_name) LIKE ? OR LOWER(r.email) LIKE ? OR r.phone LIKE ?)");const term=`%${search.toLowerCase()}%`;values.push(term,term,`%${search}%`);}const where=clauses.length?`WHERE ${clauses.join(" AND ")}`:"";
  const rows=await c.env.DB.prepare(`SELECT r.*,s.title service_title FROM service_requests r LEFT JOIN services s ON s.id=r.service_id ${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`).bind(...values,limit,(page-1)*limit).all<Row>();const count=await c.env.DB.prepare(`SELECT COUNT(*) total FROM service_requests r ${where}`).bind(...values).first<{total:number}>(),total=Number(count?.total||0);
  return c.json({success:true,data:rows.results.map(mapRequest),pagination:{page,limit,total,pages:Math.ceil(total/limit)}});
});
api.get("/api/v1/requests/:id",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{const row=await c.env.DB.prepare("SELECT r.*,s.title service_title FROM service_requests r LEFT JOIN services s ON s.id=r.service_id WHERE r.id=?").bind(c.req.param("id")).first<Row>();if(!row)throw new ApiError("Request not found",404,"REQUEST_NOT_FOUND");return c.json({success:true,data:mapRequest(row)});});
api.patch("/api/v1/requests/:id/status",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{const i=await body(c),status=String(i.status??"");if(!["PENDING","IN_PROGRESS","COMPLETED","CANCELLED"].includes(status))throw new ApiError("Invalid status value",400,"INVALID_STATUS");const result=await c.env.DB.prepare("UPDATE service_requests SET status=?,updated_at=? WHERE id=?").bind(status,nowIso(),c.req.param("id")).run();if(!result.meta.changes)throw new ApiError("Request not found",404,"REQUEST_NOT_FOUND");const row=await c.env.DB.prepare("SELECT * FROM service_requests WHERE id=?").bind(c.req.param("id")).first<Row>();return c.json({success:true,message:"Status updated.",data:row?mapRequest(row):null});});

// Notifications
api.get("/api/v1/notifications",requireAuth,async(c)=>{const page=Math.max(1,Number(c.req.query("page"))||1),limit=Math.min(50,Math.max(1,Number(c.req.query("limit"))||20)),id=c.get("user").id;const [rows,count,unread]=await Promise.all([c.env.DB.prepare("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?").bind(id,limit,(page-1)*limit).all<Row>(),c.env.DB.prepare("SELECT COUNT(*) total FROM notifications WHERE user_id=?").bind(id).first<{total:number}>(),c.env.DB.prepare("SELECT COUNT(*) total FROM notifications WHERE user_id=? AND is_read=0").bind(id).first<{total:number}>()]);const total=Number(count?.total||0);return c.json({success:true,data:rows.results.map(mapNotification),unreadCount:Number(unread?.total||0),pagination:{page,limit,total,pages:Math.ceil(total/limit)}});});
api.patch("/api/v1/notifications/read-all",requireAuth,async(c)=>{await c.env.DB.prepare("UPDATE notifications SET is_read=1 WHERE user_id=? AND is_read=0").bind(c.get("user").id).run();return c.json({success:true,message:"All notifications marked as read."});});
api.patch("/api/v1/notifications/:id/read",requireAuth,async(c)=>{const r=await c.env.DB.prepare("UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?").bind(c.req.param("id"),c.get("user").id).run();if(!r.meta.changes)throw new ApiError("Notification not found",404,"NOT_FOUND");return c.json({success:true,message:"Marked as read."});});
api.delete("/api/v1/notifications/:id",requireAuth,async(c)=>{const r=await c.env.DB.prepare("DELETE FROM notifications WHERE id=? AND user_id=?").bind(c.req.param("id"),c.get("user").id).run();if(!r.meta.changes)throw new ApiError("Notification not found",404,"NOT_FOUND");return c.json({success:true,message:"Notification deleted."});});

// Users
api.get("/api/v1/users",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{const page=Math.max(1,Number(c.req.query("page"))||1),limit=Math.min(100,Math.max(1,Number(c.req.query("limit"))||20)),search=(c.req.query("search")||"").trim().toLowerCase(),role=c.req.query("role"),clauses:string[]=[],values:unknown[]=[];if(search){clauses.push("(LOWER(full_name) LIKE ? OR LOWER(email) LIKE ?)");values.push(`%${search}%`,`%${search}%`);}if(role&&["MASTER_ADMIN","ADMIN","USER"].includes(role)){clauses.push("role=?");values.push(role);}const where=clauses.length?`WHERE ${clauses.join(" AND ")}`:"",rows=await c.env.DB.prepare(`SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...values,limit,(page-1)*limit).all<Row>(),count=await c.env.DB.prepare(`SELECT COUNT(*) total FROM users ${where}`).bind(...values).first<{total:number}>(),total=Number(count?.total||0);return c.json({success:true,data:rows.results.map(mapUser),pagination:{page,limit,total,pages:Math.ceil(total/limit)}});});
api.get("/api/v1/users/:id",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{const u=await findUser(c.env,c.req.param("id"));if(!u)throw new ApiError("User not found",404,"USER_NOT_FOUND");return c.json({success:true,data:mapUser(u)});});
api.patch("/api/v1/users/:id/suspend",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{const actor=c.get("user"),id=c.req.param("id");if(actor.id===id)throw new ApiError("Cannot suspend your own account",400,"SELF_SUSPEND");const u=await findUser(c.env,id);if(!u)throw new ApiError("User not found",404,"USER_NOT_FOUND");if(u.role==="MASTER_ADMIN")throw new ApiError("MASTER_ADMIN cannot be modified",403,"CANNOT_MODIFY_MASTER_ADMIN");const suspended=asBoolean(u.is_suspended)?0:1;await c.env.DB.prepare("UPDATE users SET is_suspended=?,refresh_token_hash=NULL,updated_at=? WHERE id=?").bind(suspended,nowIso(),id).run();return c.json({success:true,message:`User ${suspended?"suspended":"unsuspended"}.`,data:{id,isSuspended:Boolean(suspended)}});});
api.patch("/api/v1/users/:id/role",requireAuth,requireRole("MASTER_ADMIN"),async(c)=>{const i=await body(c),role=String(i.role??"") as Role;if(!["ADMIN","USER"].includes(role))throw new ApiError("Cannot assign this role",403,"CANNOT_ASSIGN_MASTER_ADMIN");const u=await findUser(c.env,c.req.param("id"));if(!u)throw new ApiError("User not found",404,"USER_NOT_FOUND");if(u.role==="MASTER_ADMIN")throw new ApiError("MASTER_ADMIN cannot be modified",403,"CANNOT_MODIFY_MASTER_ADMIN");await c.env.DB.prepare("UPDATE users SET role=?,updated_at=? WHERE id=?").bind(role,nowIso(),u.id).run();const updated=await findUser(c.env,String(u.id));return c.json({success:true,message:"Role updated.",data:updated?mapUser(updated):null});});
api.delete("/api/v1/users/:id",requireAuth,requireRole("MASTER_ADMIN"),async(c)=>{const actor=c.get("user"),id=c.req.param("id");if(actor.id===id)throw new ApiError("Cannot delete your own account",400,"SELF_DELETE");const u=await findUser(c.env,id);if(!u)throw new ApiError("User not found",404,"USER_NOT_FOUND");if(u.role==="MASTER_ADMIN")throw new ApiError("MASTER_ADMIN cannot be modified",403,"CANNOT_MODIFY_MASTER_ADMIN");await c.env.DB.prepare("DELETE FROM users WHERE id=?").bind(id).run();return c.json({success:true,message:"User deleted."});});

// Dashboard
api.get("/api/v1/analytics/stats",requireAuth,requireRole("ADMIN","MASTER_ADMIN"),async(c)=>{const start=new Date();start.setUTCDate(1);start.setUTCHours(0,0,0,0);const previous=new Date(start);previous.setUTCMonth(previous.getUTCMonth()-1);const [x,recent]=await Promise.all([c.env.DB.prepare(`SELECT (SELECT COUNT(*) FROM users) total_users,(SELECT COUNT(*) FROM service_requests) total_requests,(SELECT COUNT(*) FROM services WHERE is_active=1) total_services,(SELECT COUNT(*) FROM service_requests WHERE status='PENDING') pending_requests,(SELECT COUNT(*) FROM service_requests WHERE created_at>=?) new_requests_month,(SELECT COUNT(*) FROM users WHERE created_at>=?) new_users_month,(SELECT COUNT(*) FROM service_requests WHERE created_at>=? AND created_at<?) requests_last_month,(SELECT COUNT(*) FROM users WHERE created_at>=? AND created_at<?) users_last_month`).bind(start.toISOString(),start.toISOString(),previous.toISOString(),start.toISOString(),previous.toISOString(),start.toISOString()).first<Row>(),c.env.DB.prepare("SELECT r.*,s.title service_title FROM service_requests r LEFT JOIN services s ON s.id=r.service_id ORDER BY r.created_at DESC LIMIT 5").all<Row>()]);const cr=Number(x?.new_requests_month||0),cu=Number(x?.new_users_month||0),lr=Number(x?.requests_last_month||0),lu=Number(x?.users_last_month||0);return c.json({success:true,data:{totalUsers:Number(x?.total_users||0),totalRequests:Number(x?.total_requests||0),totalServices:Number(x?.total_services||0),pendingRequests:Number(x?.pending_requests||0),newRequestsThisMonth:cr,newUsersThisMonth:cu,requestGrowth:lr?(((cr-lr)/lr)*100).toFixed(1):null,userGrowth:lu?(((cu-lu)/lu)*100).toFixed(1):null,recentRequests:recent.results.map(mapRequest)}});});
