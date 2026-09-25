import nodemailer, { Transporter } from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../config/logger';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

let smtpTransporter: Transporter | null = null;
let resendClient: Resend | null = null;

const getSmtpTransporter = (): Transporter => {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return smtpTransporter;
};

const getResendClient = (): Resend => {
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
};

/**
 * Sends a transactional email using the configured provider
 * (Resend by default, falling back to SMTP via Nodemailer).
 */
export const sendEmail = async ({ to, subject, html }: SendEmailOptions): Promise<void> => {
  if (env.EMAIL_PROVIDER === 'resend' && env.RESEND_API_KEY) {
    try {
      const resend = getResendClient();
      const result = await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });
      if (result.error) throw new Error(result.error.message);
      return;
    } catch (err) {
      logger.warn('Resend failed; attempting SMTP fallback', {
        to,
        subject,
        error: (err as Error).message,
      });

      if (!env.SMTP_HOST || !env.SMTP_PORT) throw err;
    }
  }

  try {
    if (!env.SMTP_HOST || !env.SMTP_PORT) {
      throw new Error('No working email provider is configured');
    }
    const transporter = getSmtpTransporter();
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    logger.error('Failed to send email', { to, subject, error: (err as Error).message });
    throw err;
  }
};

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
})[character] ?? character);

export const otpEmailTemplate = (fullName: string, code: string, purpose: 'verification' | 'reset'): string => {
  const title = purpose === 'verification' ? 'تأكيد بريدك الإلكتروني' : 'إعادة تعيين كلمة المرور';
  const intro =
    purpose === 'verification'
      ? 'شكرًا لتسجيلك في مونتا فوم. استخدم الرمز التالي لتأكيد بريدك الإلكتروني:'
      : 'وصلنا طلب لإعادة تعيين كلمة المرور. استخدم الرمز التالي للمتابعة:';

  return `
  <div dir="rtl" lang="ar" style="font-family: Cairo, Tahoma, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background:#f3f8fc; text-align:right;">
    <div style="background:#102f4d; color:#ffffff; padding:20px; border-radius:12px 12px 0 0; text-align:center;">
      <h2 style="margin:0;">مونتا فوم</h2>
      <p style="margin:6px 0 0; color:#bde9f5;">حلول التبريد والعزل المتكاملة</p>
    </div>
    <div style="background:#ffffff; padding:24px; border-radius:0 0 12px 12px; border:1px solid #d8e6ef;">
      <h3 style="color:#102f4d;">${title}</h3>
      <p>مرحبًا ${escapeHtml(fullName)}،</p>
      <p>${intro}</p>
      <div style="text-align:center; margin: 24px 0;">
        <span dir="ltr" style="display:inline-block; font-size:28px; font-weight:bold; letter-spacing:6px; color:#102f4d; background:#e3f6fa; padding:12px 24px; border-radius:8px;">
          ${escapeHtml(code)}
        </span>
      </div>
      <p>تنتهي صلاحية الرمز خلال ${env.OTP_EXPIRES_IN_MINUTES} دقائق.</p>
      <p style="color:#64748b; font-size:13px;">إذا لم تطلب هذا الإجراء، يمكنك تجاهل الرسالة بأمان.</p>
    </div>
  </div>`;
};

export const serviceRequestConfirmationTemplate = (fullName: string, serviceTitle?: string): string => {
  return `
  <div dir="rtl" lang="ar" style="font-family: Cairo, Tahoma, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background:#f3f8fc; text-align:right;">
    <div style="background:#102f4d; color:#ffffff; padding:20px; border-radius:12px 12px 0 0; text-align:center;">
      <h2 style="margin:0;">مونتا فوم</h2>
      <p style="margin:6px 0 0; color:#bde9f5;">حلول التبريد والعزل المتكاملة</p>
    </div>
    <div style="background:#ffffff; padding:24px; border-radius:0 0 12px 12px; border:1px solid #d8e6ef;">
      <h3 style="color:#102f4d;">تم استلام طلبك</h3>
      <p>مرحبًا ${escapeHtml(fullName)}،</p>
      <p>شكرًا لاهتمامك بخدماتنا${serviceTitle ? ` (<strong>${escapeHtml(serviceTitle)}</strong>)` : ''}.</p>
      <p>استلم فريق مونتا فوم طلبك، وسيتواصل معك أحد المختصين قريبًا عبر الهاتف أو واتساب.</p>
      <p style="color:#64748b; font-size:13px;">هذه رسالة تأكيد آلية، ولا تحتاج إلى الرد عليها.</p>
    </div>
  </div>`;
};
