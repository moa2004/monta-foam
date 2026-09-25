import bcrypt from "bcryptjs";
import schemaSql from "../drizzle/0000_initial.sql?raw";
import type { AppEnv } from "./types";

let databaseReady: Promise<void> | undefined;
const schemaStatements = schemaSql
  .split(/;\s*(?:\r?\n|$)/)
  .map((statement) => statement.trim())
  .filter((statement) => statement && !statement.startsWith("PRAGMA "));

const services = [
  ["cold-storage-rooms", "غرف التخزين البارد", "غرف تخزين بارد مصممة خصيصًا لكل عميل، توفر تحكمًا دقيقًا في درجة الحرارة وكفاءة عالية في استهلاك الطاقة للأغذية والأدوية والاستخدامات الصناعية."],
  ["freezing-rooms", "غرف التجميد", "غرف تجميد عالية الأداء مصممة هندسيًا للحفظ العميق للمواد القابلة للتلف عند درجات حرارة تحت الصفر."],
  ["industrial-cooling-systems", "أنظمة التبريد الصناعي", "حلول تبريد صناعية واسعة النطاق مصممة خصيصًا للمستودعات والمصانع ومراكز التوزيع."],
  ["maintenance-services", "خدمات الصيانة", "صيانة دورية وطارئة لأنظمة التبريد والتجميد لضمان استمرارية التشغيل بكفاءة وموثوقية."],
  ["installation-services", "خدمات التركيب", "تركيب احترافي شامل لمعدات التبريد والتجميد، من تجهيز الموقع حتى الاختبار والتشغيل."],
] as const;

async function initialize(env: AppEnv) {
  await env.DB.batch(schemaStatements.map((statement) => env.DB.prepare(statement)));
  const now = new Date().toISOString();
  await env.DB.batch(services.map(([slug, title, description]) => env.DB.prepare(
    `INSERT OR IGNORE INTO services (id,title,slug,description,image,is_active,created_at,updated_at)
     VALUES (?,?,?,?,NULL,1,?,?)`,
  ).bind(crypto.randomUUID(), title, slug, description, now, now)));
  await env.DB.prepare(
    `INSERT OR IGNORE INTO projects
     (id,title,subtitle,image,image_alt,link_url,sort_order,is_active,created_at,updated_at)
     VALUES ('official-project-1',?,?,?,?,?,0,1,?,?)`,
  ).bind(
    "غرف تبريد وتجهيزات معزولة",
    "من أعمال Monta Foam",
    "/images/project-1.jpg",
    "وحدات غرف تبريد وتجهيزات معزولة من تنفيذ Monta Foam",
    "https://www.facebook.com/share/1EF8EQP5nQ/",
    now,
    now,
  ).run();
  const email = env.MASTER_ADMIN_EMAIL?.trim().toLowerCase();
  if (email && env.MASTER_ADMIN_PASSWORD) {
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
    if (!existing) {
      await env.DB.prepare(
        `INSERT INTO users (id,full_name,email,password,role,is_verified,is_suspended,provider,created_at,updated_at)
         VALUES (?,?,?,?,'MASTER_ADMIN',1,0,'LOCAL',?,?)`,
      ).bind(crypto.randomUUID(), env.MASTER_ADMIN_NAME?.trim() || "Master Admin", email,
        await bcrypt.hash(env.MASTER_ADMIN_PASSWORD, 12), now, now).run();
    }
  }
}
export async function ensureDatabase(env: AppEnv) {
  databaseReady ??= initialize(env).catch((error) => { databaseReady = undefined; throw error; });
  await databaseReady;
}
export const asBoolean = (value: unknown) => value === true || value === 1;
export const mapUser = (r: Record<string, unknown>) => ({
  id: String(r.id), fullName: String(r.full_name), email: String(r.email), role: String(r.role),
  isVerified: asBoolean(r.is_verified), isSuspended: asBoolean(r.is_suspended),
  avatar: r.avatar ? String(r.avatar) : null, provider: String(r.provider), createdAt: String(r.created_at),
  ...(r.updated_at ? { updatedAt: String(r.updated_at) } : {}),
});
export const mapService = (r: Record<string, unknown>) => ({
  id: String(r.id), title: String(r.title), slug: String(r.slug), description: String(r.description),
  image: r.image ? String(r.image) : null, isActive: asBoolean(r.is_active), createdAt: String(r.created_at),
});
export const mapProject = (r: Record<string, unknown>) => ({
  id: String(r.id), title: String(r.title), subtitle: String(r.subtitle), image: String(r.image),
  imageAlt: String(r.image_alt), linkUrl: r.link_url ? String(r.link_url) : null,
  sortOrder: Number(r.sort_order), isActive: asBoolean(r.is_active), createdAt: String(r.created_at),
});
export const mapRequest = (r: Record<string, unknown>) => ({
  id: String(r.id), userId: r.user_id ? String(r.user_id) : null,
  serviceId: r.service_id ? String(r.service_id) : null,
  service: r.service_id && r.service_title ? { id: String(r.service_id), title: String(r.service_title) } : null,
  fullName: String(r.full_name), email: String(r.email), phone: String(r.phone),
  notes: r.notes ? String(r.notes) : null, status: String(r.status), createdAt: String(r.created_at),
});
export const mapNotification = (r: Record<string, unknown>) => ({
  id: String(r.id), title: String(r.title), message: String(r.message), type: r.type ? String(r.type) : null,
  metadata: r.metadata ? JSON.parse(String(r.metadata)) : null, isRead: asBoolean(r.is_read), createdAt: String(r.created_at),
});
