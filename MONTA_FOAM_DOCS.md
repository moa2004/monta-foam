# 🧊 Monta Foam — Project Documentation
## Full-Stack Web Platform | Cooling & Freezing Services

> **Version:** 1.0.0 | **Built:** June – July 2026
> **Stack:** Next.js 15 · Node.js · PostgreSQL · Prisma · TypeScript
> **Status:** ✅ Development Complete · 🔄 Ready for Production Deployment

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Backend — Features & Architecture](#4-backend--features--architecture)
5. [Frontend — Features & Architecture](#5-frontend--features--architecture)
6. [Security Implementation](#6-security-implementation)
7. [Database Schema](#7-database-schema)
8. [API Reference](#8-api-reference)
9. [Roadmap](#9-roadmap)
10. [Environment Variables](#10-environment-variables)
11. [Deployment Guide](#11-deployment-guide)

---

## 1. Project Overview

**Monta Foam** is a production-ready full-stack web platform for an Egyptian cold storage and freezing services company. The platform serves three goals:

| Goal | Description |
|------|-------------|
| **Lead Generation** | Visitors can request services; requests route to WhatsApp + admin dashboard |
| **Company Showcase** | Professional Arabic RTL website presenting services, projects, and team |
| **Administration** | Secure dashboard for managing users, requests, and real-time notifications |

---

## 2. Tech Stack

### Backend
| Technology | Version | Role |
|-----------|---------|------|
| **Node.js** | v18+ | Runtime |
| **Express.js** | v4.21 | HTTP framework |
| **TypeScript** | v5.6 | Type safety |
| **Prisma ORM** | v5.20 | Database ORM |
| **PostgreSQL** | v16 | Primary database (hosted on Neon.tech) |
| **Socket.io** | v4.8 | Real-time notifications |
| **Argon2id** | v0.40 | Password hashing |
| **JWT** | v9.0 | Access + refresh token auth |
| **Zod** | v3.23 | Schema validation |
| **Resend** | v4.0 | Transactional email |
| **Winston** | v3.14 | Structured logging |
| **Swagger UI** | v5.0 | API documentation |
| **Helmet** | v7.1 | HTTP security headers |
| **Docker** | — | Containerization |

### Frontend
| Technology | Version | Role |
|-----------|---------|------|
| **Next.js** | v15.5 | React framework (App Router) |
| **TypeScript** | v5.6 | Type safety |
| **Tailwind CSS** | v4 | Utility-first styling |
| **Framer Motion** | — | Animations |
| **React Query** | TanStack v5 | Server state management |
| **React Hook Form** | — | Form handling |
| **Zod** | v3.23 | Form validation |
| **Axios** | — | HTTP client with interceptors |
| **Socket.io Client** | — | Real-time connection |
| **Cairo Font** | Google Fonts | Arabic display typeface |
| **Lucide React** | v0.383 | Icon system |

---

## 3. Project Structure

```
monta-foam/
├── cold-storage-backend/           # Node.js API server
│   ├── prisma/
│   │   ├── schema.prisma           # Database models
│   │   └── seed.ts                 # MASTER_ADMIN + services seed
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts              # Zod-validated environment config
│   │   │   ├── prisma.ts           # Prisma client singleton
│   │   │   ├── logger.ts           # Winston logger
│   │   │   └── swagger.ts          # OpenAPI spec config
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts  # Register, login, OTP, Google, refresh, logout
│   │   │   ├── users.controller.ts # Admin user management (RBAC)
│   │   │   ├── services.controller.ts
│   │   │   ├── requests.controller.ts
│   │   │   ├── notifications.controller.ts
│   │   │   └── analytics.controller.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts  # JWT verify + role guard
│   │   │   ├── validate.middleware.ts
│   │   │   ├── sanitize.middleware.ts
│   │   │   ├── rateLimiter.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── services.routes.ts
│   │   │   ├── requests.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   ├── analytics.routes.ts
│   │   │   └── index.ts            # Root router
│   │   ├── services/
│   │   │   ├── email.service.ts    # Resend + SMTP fallback
│   │   │   ├── googleAuth.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── auditLog.service.ts
│   │   ├── sockets/
│   │   │   └── socket.ts           # Socket.io init + auth middleware
│   │   ├── utils/
│   │   │   ├── AppError.ts         # Custom error class
│   │   │   ├── catchAsync.ts       # Async handler wrapper
│   │   │   ├── jwt.ts              # Token sign/verify/hash
│   │   │   ├── password.ts         # Argon2id hash/verify
│   │   │   ├── otp.ts              # OTP generate/hash/verify
│   │   │   ├── cookies.ts          # HttpOnly cookie helpers
│   │   │   └── whatsapp.ts         # WhatsApp link builder
│   │   ├── validators/
│   │   │   └── auth.validator.ts   # Zod schemas for auth
│   │   ├── types/
│   │   ├── app.ts                  # Express app assembly
│   │   └── server.ts               # HTTP + Socket.io bootstrap
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── tsconfig.json
│
└── cold-storage-frontend/          # Next.js 15 App Router
    ├── public/
    │   └── images/
    │       ├── logo.png            # Monta Foam logo
    │       ├── project-1.png       # Real project photos
    │       ├── project-2.png
    │       └── project-3.png
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx          # Root layout (Cairo font, RTL, metadata)
    │   │   ├── globals.css         # Design tokens + Tailwind
    │   │   ├── page.tsx            # Homepage
    │   │   ├── about/page.tsx
    │   │   ├── services/page.tsx
    │   │   ├── contact/page.tsx
    │   │   └── auth/
    │   │       ├── layout.tsx      # Auth pages layout
    │   │       ├── login/page.tsx
    │   │       ├── register/page.tsx
    │   │       ├── verify/page.tsx  # OTP input (6 digits)
    │   │       └── forgot-password/page.tsx
    │   │   └── dashboard/
    │   │       ├── layout.tsx      # Sidebar + RBAC guard
    │   │       ├── page.tsx        # Stats dashboard
    │   │       ├── requests/page.tsx
    │   │       ├── users/page.tsx
    │   │       └── notifications/page.tsx
    │   ├── components/
    │   │   ├── Header.tsx          # Sticky transparent→white on scroll
    │   │   ├── Footer.tsx
    │   │   ├── WhatsAppButton.tsx  # Floating WhatsApp CTA
    │   │   ├── PageHeader.tsx      # Shared page hero
    │   │   ├── RequestServiceModal.tsx
    │   │   ├── Providers.tsx       # React Query + Auth context
    │   │   ├── LogoMark.tsx
    │   │   ├── ThermalReadout.tsx
    │   │   ├── icons/
    │   │   │   └── FacebookIcon.tsx
    │   │   └── sections/
    │   │       ├── Hero.tsx        # Full-bleed photo hero
    │   │       ├── WhyChooseUs.tsx
    │   │       ├── ServicesPreview.tsx
    │   │       ├── Gallery.tsx     # Real project photos
    │   │       ├── Testimonials.tsx
    │   │       └── ContactCta.tsx
    │   ├── hooks/
    │   │   ├── useAuth.tsx         # Auth context + provider
    │   │   ├── useServices.ts      # React Query services fetch
    │   │   └── useRequestService.ts
    │   ├── lib/
    │   │   ├── api.ts              # Axios + token interceptors
    │   │   ├── constants.ts        # Company info, social links
    │   │   ├── utils.ts            # cn() class merge
    │   │   ├── fallback-services.ts
    │   │   └── service-icons.ts
    │   └── types/
    │       └── index.ts            # Shared TypeScript types
    ├── .env.local.example
    ├── next.config.ts
    └── package.json
```

---

## 4. Backend — Features & Architecture

### 4.1 Authentication System

| Feature | Implementation | Details |
|---------|---------------|---------|
| **Email Registration** | `POST /api/v1/auth/register` | Validates → hashes password (Argon2id) → sends OTP email |
| **Email Verification** | `POST /api/v1/auth/verify-email` | 6-digit OTP, hashed in DB, expires in 10 min |
| **Resend OTP** | `POST /api/v1/auth/resend-otp` | Invalidates old OTPs before sending new one |
| **Email Login** | `POST /api/v1/auth/login` | Argon2id verify → issues access + refresh tokens |
| **Google OAuth** | `POST /api/v1/auth/google` | Verifies Google ID token server-side → auto-creates/links account |
| **Token Refresh** | `POST /api/v1/auth/refresh` | Reads HttpOnly cookie → validates hash → rotates both tokens |
| **Logout** | `POST /api/v1/auth/logout` | Clears refresh token hash in DB + clears cookies |
| **Forgot Password** | `POST /api/v1/auth/forgot-password` | Sends OTP (never reveals if email exists) |
| **Reset Password** | `POST /api/v1/auth/reset-password` | Verifies OTP → hashes new password → revokes all sessions |
| **Get Me** | `GET /api/v1/auth/me` | Returns authenticated user profile |

**Token Architecture:**
```
Access Token (15 min)  →  in Authorization header OR accessToken cookie
Refresh Token (7 days) →  HttpOnly, Secure, SameSite=Strict cookie
                           path restricted to /api/v1/auth/refresh
                           stored as SHA-256 hash in DB (never plaintext)
```

**Refresh Token Rotation:**
- Every refresh issues a NEW refresh token and invalidates the old one
- If an old token is reused → token family compromise detected → ALL sessions revoked

---

### 4.2 Role-Based Access Control (RBAC)

```
MASTER_ADMIN
  └── Full system access
  └── Can create/modify ADMIN users
  └── Cannot be edited or deleted by anyone
  └── Cannot have role changed

ADMIN
  └── View + manage all service requests
  └── View + manage users (except MASTER_ADMIN)
  └── View analytics dashboard
  └── Receive real-time notifications

USER
  └── Submit service requests
  └── View own request history
  └── Manage own profile
```

**Middleware chain for protected routes:**
```
authenticate() → verify JWT → attach req.user
authorize(Role.ADMIN, Role.MASTER_ADMIN) → check role
requireVerified() → check isVerified (optional)
```

---

### 4.3 Service Request Module

**Flow when a user submits a request:**
```
1. POST /api/v1/requests (no auth required — guests can submit)
2. Save to DB (ServiceRequest table)
3. [parallel, fire-and-forget]:
   a. Send confirmation email to user (Resend)
   b. Create notification for all admins
   c. Emit real-time socket event to admin rooms
   d. Record audit log
4. Return WhatsApp deep-link pre-filled with request details
```

**WhatsApp Message Format:**
```
Hello,
I would like to request a cold storage service.

Name: {fullName}
Phone: {phone}
Service: {serviceTitle}
Notes: {notes}
```

---

### 4.4 Real-Time Notifications (Socket.io)

**Architecture:**
```
Client connects with Bearer token in handshake.auth
Server verifies JWT → joins user to room "user:{userId}"
On new notification → server emits to room → client receives instantly
```

**Notification triggers:**
| Event | Who Gets Notified |
|-------|------------------|
| New user registered | All admins |
| New service request submitted | All admins |
| Email verified | All admins |
| Google OAuth login (first time) | All admins |

---

### 4.5 Email Service

**Provider priority:**
```
1. Resend (primary) — if RESEND_API_KEY is set
2. Nodemailer SMTP (fallback) — if Resend fails or not configured
```

**Email templates:**
- OTP Verification — branded HTML with 6-digit code, 10-min expiry notice
- Password Reset — same branded template with reset code
- Service Request Confirmation — sent to customer after submission

---

### 4.6 Audit Logging

Every significant action is logged to the `audit_logs` table:

| Action | Trigger |
|--------|---------|
| `USER_REGISTERED` | New account created |
| `LOGIN_SUCCESS` | Successful login |
| `LOGIN_FAILED` | Wrong credentials |
| `EMAIL_VERIFIED` | OTP confirmed |
| `GOOGLE_LOGIN` | Google OAuth login |
| `LOGOUT` | User logged out |
| `TOKEN_REFRESHED` | Refresh token used |
| `PASSWORD_RESET_REQUESTED` | Forgot password submitted |
| `PASSWORD_RESET_SUCCESS` | Password changed |
| `ROLE_CHANGED` | Admin changed user role |
| `USER_SUSPENDED` | Account suspended |
| `USER_UNSUSPENDED` | Suspension lifted |
| `SERVICE_REQUEST_CREATED` | New request submitted |

Each log stores: `action`, `actorId`, `metadata (JSON)`, `ipAddress`, `userAgent`, `createdAt`

---

### 4.7 API Security Layers

```
Request incoming
  │
  ├── Helmet (security headers: CSP, HSTS, X-Frame-Options…)
  ├── CORS (only CLIENT_URL origin allowed)
  ├── express.json({ limit: '10kb' }) (payload size limit)
  ├── hpp() (HTTP Parameter Pollution prevention)
  ├── sanitizeInput() (XSS strip via xss library, recursive)
  ├── apiLimiter (100 req / 15 min global)
  │
  ├── authLimiter (50 req / 15 min on auth endpoints) [dev]
  │                (10 req / 15 min on auth endpoints) [prod]
  ├── otpLimiter  (30 req / 15 min on OTP endpoints) [dev]
  │               (5 req / 15 min on OTP endpoints)  [prod]
  │
  ├── validate(schema) — Zod parse + transform
  ├── authenticate() — JWT verify
  └── authorize(...roles) — Role check
```

---

### 4.8 Analytics Dashboard Endpoint

`GET /api/v1/analytics/stats` returns (in a single `$transaction`):

```json
{
  "totalUsers": 42,
  "totalRequests": 180,
  "totalServices": 5,
  "pendingRequests": 12,
  "newRequestsThisMonth": 23,
  "newUsersThisMonth": 8,
  "requestGrowth": "+15.2",
  "userGrowth": "+33.3",
  "recentRequests": [ ...last 5 requests with service title ]
}
```

---

## 5. Frontend — Features & Architecture

### 5.1 Pages

| Page | Route | Auth | Description |
|------|-------|------|-------------|
| **Homepage** | `/` | Public | Hero, Why Choose Us, Services Preview, Gallery, Testimonials, CTA |
| **Services** | `/services` | Public | Full services list + Request Service modal |
| **About Us** | `/about` | Public | Company story, mission/vision, stats, team |
| **Contact** | `/contact` | Public | Contact form + WhatsApp + social links |
| **Login** | `/auth/login` | Guest | Email/password login |
| **Register** | `/auth/register` | Guest | Account creation |
| **Verify Email** | `/auth/verify` | Guest | 6-digit OTP input UI |
| **Forgot Password** | `/auth/forgot-password` | Guest | 2-step: email → OTP + new password |
| **Dashboard** | `/dashboard` | ADMIN+ | Stats overview |
| **Requests** | `/dashboard/requests` | ADMIN+ | Table + status management |
| **Users** | `/dashboard/users` | ADMIN+ | User list + role/suspend controls |
| **Notifications** | `/dashboard/notifications` | ADMIN+ | Real-time notification center |

---

### 5.2 Design System

**Brand palette (Monta Foam):**
```
--monta-blue:   #1BA8D5   Primary brand blue (from logo)
--monta-dark:   #0D3A52   Dark navy for headings + footer
--monta-navy:   #082435   Deepest navy (footer bg)
--monta-light:  #E8F6FB   Light blue tint (badges, cards bg)
--monta-gray:   #F4F7F9   Section backgrounds
--monta-text:   #1A2A35   Body text
--monta-muted:  #6B8394   Secondary text / captions
--monta-border: #D4E8F0   Subtle borders
```

**Typography:**
- **Cairo** (Google Fonts, Arabic + Latin) — headings, body, UI
- RTL-first layout (`<html dir="rtl" lang="ar">`)

**Design signature:** The hero section uses a real full-bleed project photo (cold storage room exterior) as background with a directional gradient overlay — grounding the brand in the actual product rather than abstract illustration.

---

### 5.3 Component Architecture

**State management:**
- **React Query** — all server data (services, requests, users, stats)
- **Auth Context** (`useAuth`) — user session, login/logout, token management
- **React Hook Form + Zod** — all forms (validation, transformation, error display)

**API layer (`src/lib/api.ts`):**
```typescript
Axios instance with:
  - baseURL from NEXT_PUBLIC_API_URL
  - withCredentials: true (sends cookies)
  - Request interceptor: attaches Bearer token from sessionStorage
  - Response interceptor: on 401 → auto-refresh → retry once
                          on refresh failure → clear token + session
```

**Auth persistence:**
```
Access token  → sessionStorage (cleared on tab close)
Refresh token → HttpOnly cookie (survives reload, cleared on logout)
```

---

### 5.4 Service Request Flow (Frontend)

```
User clicks "اطلب الخدمة" on any service card
  │
  ▼
RequestServiceModal opens (pre-filled with service)
  │
  ▼
Form: fullName, phone, email, (serviceId), notes
  │
  ▼
Zod validation (client-side)
  │
  ▼
POST /api/v1/requests
  │
  ├── Success → Show confirmation + WhatsApp button
  │             (WhatsApp pre-filled with request details)
  └── Error   → Show error message
```

---

### 5.5 Dashboard Features

**Stats Page:**
- Total users, requests, active services, pending requests
- Month-over-month growth % for users and requests
- Recent 5 requests with status badges

**Requests Management:**
- Paginated table (15 per page)
- Search by name / phone / email
- Filter by status (PENDING / IN_PROGRESS / COMPLETED / CANCELLED)
- Inline status update dropdown

**Users Management:**
- Paginated table with search
- Role badge display
- MASTER_ADMIN: can change roles (USER ↔ ADMIN)
- Suspend/unsuspend toggle (protected: can't suspend self or MASTER_ADMIN)

**Notifications:**
- Real-time via Socket.io (auto-reconnects)
- Unread count badge
- Mark single / all as read
- Delete individual notifications
- Polls every 30 seconds as fallback

---

## 6. Security Implementation

### OWASP Top 10 Coverage

| Threat | Protection |
|--------|-----------|
| **SQL Injection** | Prisma ORM — parameterized queries only, no raw SQL |
| **XSS (Stored/Reflected)** | `xss` library sanitizes all input recursively |
| **CSRF** | SameSite=Strict cookies + CORS origin restriction |
| **Broken Authentication** | Argon2id hashing, refresh token rotation, OTP expiry |
| **Broken Access Control** | RBAC middleware on every protected route |
| **Security Misconfiguration** | Helmet headers, disabled error stack in production |
| **Sensitive Data Exposure** | Passwords never returned in API, refresh tokens hashed |
| **Injection (General)** | Zod validation + XSS sanitization on all inputs |
| **Insecure Deserialization** | JSON payload size limit (10kb) |
| **SSRF** | Google OAuth verified server-side, no user-supplied URLs fetched |
| **Clickjacking** | Helmet X-Frame-Options header |
| **Rate Limiting** | 3-tier: global API / auth endpoints / OTP endpoints |
| **IDOR** | Notifications/requests ownership check before any mutation |

---

## 7. Database Schema

### Models

```
User
  id              UUID (PK)
  fullName        String
  email           String (unique)
  password        String? (nullable for Google OAuth)
  role            Enum: MASTER_ADMIN | ADMIN | USER
  isVerified      Boolean (default: false)
  isSuspended     Boolean (default: false)
  avatar          String?
  provider        Enum: LOCAL | GOOGLE
  googleId        String? (unique)
  refreshTokenHash String? (SHA-256 hash)
  createdAt       DateTime
  updatedAt       DateTime

OTP
  id              UUID (PK)
  userId          → User
  code            String (Argon2id hash)
  purpose         Enum: EMAIL_VERIFICATION | PASSWORD_RESET
  expiresAt       DateTime
  consumed        Boolean (default: false)
  createdAt       DateTime

Service
  id              UUID (PK)
  title           String
  slug            String (unique)
  description     String
  image           String?
  isActive        Boolean (default: true)
  createdAt       DateTime
  updatedAt       DateTime

ServiceRequest
  id              UUID (PK)
  userId          → User? (nullable — guests allowed)
  serviceId       → Service? (nullable)
  fullName        String
  email           String
  phone           String
  notes           String?
  status          Enum: PENDING | IN_PROGRESS | COMPLETED | CANCELLED
  createdAt       DateTime
  updatedAt       DateTime

Notification
  id              UUID (PK)
  userId          → User (recipient)
  title           String
  message         String
  type            String? (NEW_REQUEST | NEW_USER | EMAIL_VERIFIED | …)
  metadata        Json?
  isRead          Boolean (default: false)
  createdAt       DateTime

AuditLog
  id              UUID (PK)
  action          String
  actorId         → User?
  metadata        Json?
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime
```

---

## 8. API Reference

**Base URL:** `http://localhost:5000/api/v1`
**Swagger Docs:** `http://localhost:5000/api-docs`

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register new account |
| POST | `/auth/verify-email` | — | Verify OTP → get tokens |
| POST | `/auth/resend-otp` | — | Resend verification OTP |
| POST | `/auth/login` | — | Login with email/password |
| POST | `/auth/google` | — | Login/register with Google ID token |
| POST | `/auth/refresh` | Cookie | Rotate refresh token |
| POST | `/auth/logout` | Bearer | Logout + clear session |
| POST | `/auth/forgot-password` | — | Send password reset OTP |
| POST | `/auth/reset-password` | — | Reset password with OTP |
| GET  | `/auth/me` | Bearer | Get current user |

### Services Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/services` | — | List active services |
| GET | `/services/:id` | — | Get single service |
| GET | `/services/admin/all` | ADMIN+ | List all (including inactive) |
| POST | `/services` | ADMIN+ | Create service |
| PATCH | `/services/:id` | ADMIN+ | Update service |
| DELETE | `/services/:id` | ADMIN+ | Delete service |

### Requests Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/requests` | Optional | Submit service request |
| GET | `/requests/me` | USER | My request history |
| GET | `/requests` | ADMIN+ | List all requests (paginated, filterable) |
| GET | `/requests/:id` | ADMIN+ | Get request details |
| PATCH | `/requests/:id/status` | ADMIN+ | Update request status |

### Users Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | ADMIN+ | List users (search, paginate) |
| GET | `/users/:id` | ADMIN+ | Get user |
| PATCH | `/users/:id/role` | ADMIN+ | Change user role |
| PATCH | `/users/:id/suspend` | ADMIN+ | Toggle suspension |
| DELETE | `/users/:id` | MASTER_ADMIN | Delete user |

### Notifications Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Bearer | My notifications (paginated) |
| PATCH | `/notifications/:id/read` | Bearer | Mark one as read |
| PATCH | `/notifications/read-all` | Bearer | Mark all as read |
| DELETE | `/notifications/:id` | Bearer | Delete notification |

### Analytics Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics/stats` | ADMIN+ | Dashboard statistics |

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | API health status |

---

## 9. Roadmap

### ✅ Phase 1 — Core Platform (Complete)

- [x] Backend API with Express + TypeScript
- [x] PostgreSQL database with Prisma ORM
- [x] JWT authentication (access + refresh token rotation)
- [x] Email/password registration with OTP verification
- [x] Google OAuth 2.0 integration
- [x] Forgot/reset password via OTP
- [x] Role-Based Access Control (MASTER_ADMIN / ADMIN / USER)
- [x] Service request submission (guests + users)
- [x] WhatsApp redirect with pre-filled message
- [x] Email notifications via Resend
- [x] Real-time notifications via Socket.io
- [x] Audit logging for all significant actions
- [x] Security hardening (Helmet, CORS, rate limiting, XSS, HPP)
- [x] Swagger API documentation
- [x] Docker + docker-compose configuration
- [x] Database seeding (MASTER_ADMIN + 5 services)
- [x] Next.js 15 frontend (App Router, TypeScript, RTL Arabic)
- [x] Monta Foam brand identity (logo, colors, fonts, real photos)
- [x] Homepage (Hero, Why Choose Us, Services, Gallery, Testimonials, CTA)
- [x] Services page with request modal
- [x] About Us page (story, mission, stats, team)
- [x] Contact page with WhatsApp integration
- [x] Auth pages (Login, Register, OTP Verify, Forgot Password)
- [x] Admin Dashboard (Stats, Requests, Users, Notifications)
- [x] React Query data fetching with fallback data
- [x] Auto token refresh via Axios interceptor

---

### 🔄 Phase 2 — Enhancement (Next)

- [ ] **Image uploads** — Upload real project photos via Cloudinary/S3
- [ ] **Services management UI** — Admin can add/edit/delete services from dashboard (no code needed)
- [ ] **Request export** — Export requests as Excel/CSV from dashboard
- [x] **Email templates** — Rich HTML email templates with Monta Foam branding
- [ ] **Arabic/English toggle** — i18n with `next-intl` (bilingual site)
- [ ] **Google Maps** — Embed company location on contact page
- [ ] **Projects/Gallery CMS** — Admin uploads project photos + descriptions
- [ ] **Password change** — "Change my password" page for logged-in users
- [ ] **Profile management** — Edit name, avatar, phone

---

### 🚀 Phase 3 — Growth (Future)

- [ ] **Quotation system** — Admin can send price quotes directly from dashboard
- [ ] **Customer portal** — Users see request status updates with timeline
- [ ] **SMS notifications** — OTP and request updates via SMS (Vonage/Twilio)
- [ ] **Analytics charts** — Visual charts for requests, users, and growth trends
- [ ] **SEO optimization** — Dynamic sitemap, structured data (JSON-LD), Open Graph images
- [ ] **PWA** — Installable app with offline support
- [ ] **Multi-branch** — Support multiple company branches/locations
- [ ] **Staff accounts** — Field engineer role (can update request status)
- [ ] **Invoice generation** — PDF invoice for completed projects

---

## 10. Environment Variables

### Backend (`.env`)

```env
# App
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5000

# Database (Neon.tech PostgreSQL)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# JWT (generate with: node -e "require('crypto').randomBytes(64).toString('hex')")
JWT_ACCESS_SECRET=<64-byte hex>
JWT_REFRESH_SECRET=<64-byte hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookies
COOKIE_DOMAIN=localhost          # production: yourdomain.com
COOKIE_SECURE=false              # production: true

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# OTP
OTP_EXPIRES_IN_MINUTES=10
OTP_LENGTH=6

# Email (Resend — resend.com)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxx
EMAIL_FROM="Monta Foam <onboarding@resend.dev>"    # dev
# EMAIL_FROM="Monta Foam <no-reply@montafoam.com>" # prod (after domain setup)

# WhatsApp
WHATSAPP_ENGINEER_NUMBER=201XXXXXXXXX  # no + or leading 0

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000     # 15 minutes
RATE_LIMIT_MAX=100              # requests per window

# Seed
MASTER_ADMIN_EMAIL=admin@montafoam.com
MASTER_ADMIN_PASSWORD=YourStrongPassword@123
MASTER_ADMIN_NAME=Mona Admin
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

---

## 11. Deployment Guide

### Local Development

```bash
# Backend
cd cold-storage-backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
# → http://localhost:5000

# Frontend (new terminal)
cd cold-storage-frontend
npm install
npm run dev
# → http://localhost:3000
```

### Docker (Local)

```bash
cd cold-storage-backend
cp .env.example .env   # fill in values
docker compose up --build

# Once running, migrate + seed:
docker compose exec api npx prisma migrate deploy
docker compose exec api npm run seed
```

### Production Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| **Frontend** | Vercel | Connect GitHub repo → auto-deploy on push |
| **Backend** | Railway / VPS | Set env vars in Railway dashboard |
| **Database** | Neon.tech | Already hosted — just use production connection string |
| **Email** | Resend | Add domain DNS records for custom `from` address |

**Production checklist:**
- [ ] Set `NODE_ENV=production`
- [ ] Set `COOKIE_SECURE=true`
- [ ] Set `COOKIE_DOMAIN=yourdomain.com`
- [ ] Update `CLIENT_URL` and `API_URL` to real domains
- [ ] Update `GOOGLE_CALLBACK_URL` to production URL
- [ ] Set auth limiter back to `max: 10` and OTP limiter to `max: 5`
- [ ] Add domain to Resend → update `EMAIL_FROM`
- [ ] Run `prisma migrate deploy` (not `dev`) in production
- [ ] Set up SSL certificate

---

*Documentation generated for Monta Foam v1.0.0 — Cooling & Freezing Services Platform*
*Built with ❤️ using Next.js 15 · Node.js · PostgreSQL · TypeScript*
