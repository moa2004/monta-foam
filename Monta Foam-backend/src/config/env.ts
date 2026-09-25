import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0' || normalized === '') return false;
  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url(),
  API_URL: z.string().url(),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: booleanFromEnv.default(false),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('strict'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),

  OTP_EXPIRES_IN_MINUTES: z.coerce.number().default(10),
  OTP_LENGTH: z.coerce.number().default(6),

  EMAIL_PROVIDER: z.enum(['resend', 'smtp']).default('resend'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Monta Foam <no-reply@example.com>'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  WHATSAPP_ENGINEER_NUMBER: z.string().default(''),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  MASTER_ADMIN_EMAIL: z.string().email().optional(),
  MASTER_ADMIN_PASSWORD: z.string().optional(),
  MASTER_ADMIN_NAME: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
export type Env = typeof env;
