# Monta Foam — Backend API

Node.js + Express + TypeScript API for the Monta Foam platform, built with Prisma ORM and PostgreSQL.

## Stack

- Node.js, Express, TypeScript
- PostgreSQL + Prisma ORM
- JWT (access + rotating refresh tokens), Google OAuth 2.0, OTP email verification
- Argon2id password hashing
- Role-Based Access Control (MASTER_ADMIN, ADMIN, USER)
- Socket.io real-time notifications
- Helmet, CORS, rate limiting, XSS sanitization, HPP — OWASP-aligned hardening
- Swagger / OpenAPI docs
- Docker & docker-compose

## Getting started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# fill in real values: DATABASE_URL, JWT secrets, Google OAuth, email provider, etc.
```

### 3. Set up the database
```bash
npx prisma migrate dev --name init
npm run seed   # creates MASTER_ADMIN user + sample services
```

### 4. Run in development
```bash
npm run dev
```

API will be available at `http://localhost:5000`, Swagger docs at `http://localhost:5000/api-docs`, and the OpenAPI JSON at `http://localhost:5000/api-docs.json`.

### 5. Build for production
```bash
npm run build
npm start
```

## Docker

```bash
cp .env.example .env   # configure first
docker compose up --build
```

This spins up PostgreSQL + the API together. Run migrations once the containers are up:
```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npm run seed
```

## Project structure

```
src/
  config/       env validation, Prisma client, logger, Swagger spec
  controllers/  route handlers (auth, users, services, requests, notifications, analytics)
  middlewares/  auth/RBAC, validation, sanitization, rate limiting, error handling
  routes/       Express routers per resource
  services/     email, Google OAuth, audit log, notifications
  sockets/      Socket.io real-time setup
  utils/        JWT, password hashing, OTP, cookies, WhatsApp link builder
  validators/   Zod schemas
  app.ts        Express app assembly
  server.ts     HTTP + Socket.io bootstrap, graceful shutdown
prisma/
  schema.prisma Database models
  seed.ts       MASTER_ADMIN + sample services seeding
```

## Default roles

- **MASTER_ADMIN** — full access, cannot be modified or deleted by anyone (including other admins). Created via `npm run seed` using `MASTER_ADMIN_EMAIL` / `MASTER_ADMIN_PASSWORD` from `.env`.
- **ADMIN** — manages users (except MASTER_ADMIN), requests, services, and notifications. Only MASTER_ADMIN can change roles.
- **USER** — manages own profile, submits/view own service requests.

## Security notes

- Passwords and OTP codes are hashed with Argon2id — never stored in plaintext.
- Refresh tokens are rotated on every use; reuse of an old token revokes the session (replay-attack protection).
- All input is validated with Zod and sanitized against XSS.
- Auth and OTP endpoints have stricter rate limits than the general API.
