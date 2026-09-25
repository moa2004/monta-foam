import type { AppEnv } from "./types";
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[c] || c);
export async function sendOtpEmail(env: AppEnv, to: string, name: string, code: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET") {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return;
  const subject = purpose === "EMAIL_VERIFICATION" ? "تأكيد بريدك الإلكتروني – مونتا فوم" : "إعادة تعيين كلمة المرور – مونتا فوم";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [to], subject,
      html: `<div dir="rtl" style="font-family:Arial;padding:32px;background:#07131f;color:#f4fbff"><h2>${subject}</h2><p>مرحبًا ${escapeHtml(name)}،</p><p>رمز التحقق:</p><p dir="ltr" style="font-size:32px;letter-spacing:8px;color:#35d5ef">${code}</p><p>صالح لمدة 10 دقائق.</p></div>` }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}
