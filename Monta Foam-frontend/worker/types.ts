export type Role = "MASTER_ADMIN" | "ADMIN" | "USER";
export interface AppEnv {
  ASSETS: Fetcher;
  DB: D1Database;
  JWT_ACCESS_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_CALLBACK_URL?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  MASTER_ADMIN_EMAIL?: string;
  MASTER_ADMIN_PASSWORD?: string;
  MASTER_ADMIN_NAME?: string;
  WHATSAPP_NUMBER?: string;
}
export interface AuthUser { id: string; role: Role; isVerified: boolean; }
export type Variables = { user: AuthUser };
