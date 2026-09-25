import { SignJWT, jwtVerify } from "jose";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context, MiddlewareHandler } from "hono";
import type { AppEnv, AuthUser, Role, Variables } from "./types";
type HonoEnv = { Bindings: AppEnv; Variables: Variables };
type ApiContext = Context<HonoEnv>;
const key = (value: string) => new TextEncoder().encode(value);
const accessSecret = (e: AppEnv) => key(e.JWT_ACCESS_SECRET || "monta-foam-local-access-secret-change-me");
const refreshSecret = (e: AppEnv) => key(e.JWT_REFRESH_SECRET || "monta-foam-local-refresh-secret-change-me");
export async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", key(value));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function issueTokens(env: AppEnv, user: AuthUser) {
  const now = Math.floor(Date.now() / 1000);
  const accessToken = await new SignJWT({ role: user.role, isVerified: user.isVerified })
    .setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt(now).setExpirationTime(now + 900).sign(accessSecret(env));
  const refreshToken = await new SignJWT({ tokenId: crypto.randomUUID() })
    .setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt(now).setExpirationTime(now + 604800).sign(refreshSecret(env));
  return { accessToken, refreshToken };
}
export async function verifyRefresh(env: AppEnv, token: string) {
  const result = await jwtVerify(token, refreshSecret(env), { algorithms: ["HS256"] });
  if (!result.payload.sub) throw new Error("Missing token subject");
  return result.payload.sub;
}
export function setAuthCookies(c: ApiContext, access: string, refresh: string) {
  const secure = new URL(c.req.url).protocol === "https:";
  setCookie(c, "accessToken", access, { httpOnly: true, secure, sameSite: "Lax", path: "/", maxAge: 900 });
  setCookie(c, "refreshToken", refresh, { httpOnly: true, secure, sameSite: "Lax", path: "/api/v1/auth", maxAge: 604800 });
}
export function clearAuthCookies(c: ApiContext) {
  deleteCookie(c, "accessToken", { path: "/" }); deleteCookie(c, "refreshToken", { path: "/api/v1/auth" });
}
async function readUser(c: ApiContext): Promise<AuthUser | null> {
  const h = c.req.header("Authorization");
  const token = h?.startsWith("Bearer ") ? h.slice(7) : getCookie(c, "accessToken");
  if (!token) return null;
  try {
    const result = await jwtVerify(token, accessSecret(c.env), { algorithms: ["HS256"] });
    const role = result.payload.role as Role | undefined;
    return result.payload.sub && role && ["MASTER_ADMIN", "ADMIN", "USER"].includes(role)
      ? { id: result.payload.sub, role, isVerified: result.payload.isVerified === true } : null;
  } catch { return null; }
}
async function readCurrentUser(c: ApiContext): Promise<AuthUser | null> {
  const tokenUser = await readUser(c);
  if (!tokenUser) return null;
  const row = await c.env.DB.prepare("SELECT role,is_verified,is_suspended FROM users WHERE id=? LIMIT 1")
    .bind(tokenUser.id).first<{ role: Role; is_verified: number | boolean; is_suspended: number | boolean }>();
  if (!row || row.is_suspended === 1 || row.is_suspended === true) return null;
  if (!["MASTER_ADMIN", "ADMIN", "USER"].includes(row.role)) return null;
  return { id: tokenUser.id, role: row.role, isVerified: row.is_verified === 1 || row.is_verified === true };
}
export const optionalAuth: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const user = await readCurrentUser(c); if (user) c.set("user", user); await next();
};
export const requireAuth: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const user = await readCurrentUser(c);
  if (!user) return c.json({ success: false, message: "Authentication required", code: "UNAUTHORIZED" }, 401);
  c.set("user", user); await next();
};
export const requireRole = (...roles: Role[]): MiddlewareHandler<HonoEnv> => async (c, next) => {
  const user = c.get("user");
  if (!user || !roles.includes(user.role)) return c.json({ success: false, message: "Access denied", code: "FORBIDDEN" }, 403);
  await next();
};
