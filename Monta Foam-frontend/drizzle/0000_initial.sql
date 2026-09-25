PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  password TEXT, role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('MASTER_ADMIN','ADMIN','USER')),
  is_verified INTEGER NOT NULL DEFAULT 0, is_suspended INTEGER NOT NULL DEFAULT 0,
  avatar TEXT, provider TEXT NOT NULL DEFAULT 'LOCAL' CHECK (provider IN ('LOCAL','GOOGLE')),
  google_id TEXT UNIQUE, refresh_token_hash TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE TABLE IF NOT EXISTS otps (
  id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL, purpose TEXT NOT NULL CHECK (purpose IN ('EMAIL_VERIFICATION','PASSWORD_RESET')),
  expires_at TEXT NOT NULL, consumed INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS otps_user_idx ON otps(user_id);
CREATE INDEX IF NOT EXISTS otps_expiry_idx ON otps(expires_at);
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL, image TEXT, is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS services_slug_idx ON services(slug);
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, subtitle TEXT NOT NULL,
  image TEXT NOT NULL, image_alt TEXT NOT NULL, link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS projects_active_order_idx ON projects(is_active, sort_order);
CREATE TABLE IF NOT EXISTS service_requests (
  id TEXT PRIMARY KEY NOT NULL, user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  service_id TEXT REFERENCES services(id) ON DELETE SET NULL, full_name TEXT NOT NULL,
  email TEXT NOT NULL, phone TEXT NOT NULL, notes TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED','CANCELLED')),
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS requests_status_idx ON service_requests(status);
CREATE INDEX IF NOT EXISTS requests_user_idx ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS requests_created_idx ON service_requests(created_at);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, message TEXT NOT NULL, type TEXT, metadata TEXT,
  is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(is_read);
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY NOT NULL, action TEXT NOT NULL,
  actor_id TEXT REFERENCES users(id) ON DELETE SET NULL, metadata TEXT,
  ip_address TEXT, user_agent TEXT, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS audit_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_actor_idx ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_logs(created_at);
