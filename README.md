# Monta Foam

[![CI](https://github.com/moa2004/monta-foam/actions/workflows/ci.yml/badge.svg)](https://github.com/moa2004/monta-foam/actions/workflows/ci.yml)

Full-stack Arabic RTL platform for Monta Foam's cold-storage services. It includes the public website, customer authentication and service requests, a role-based administration dashboard, content management, and two supported API deployment paths.

## Highlights

- Responsive Arabic RTL website for services, projects, contact, and company information
- Email/password and Google authentication with access/refresh token rotation
- Customer service requests and WhatsApp hand-off
- Admin dashboard for users, requests, notifications, services, and project content
- Image upload, optimization, and managed project gallery
- Cloudflare Worker API using Hono and D1
- Express API using Prisma and PostgreSQL for traditional server deployments
- Security controls including RBAC, rate limiting, secure headers, input validation, and audit logs

## Repository layout

```text
.
|-- Monta Foam-frontend/   Next.js 16 web app and Cloudflare Worker API
|-- Monta Foam-backend/    Express, Prisma, and PostgreSQL API
|-- MONTA_FOAM_DOCS.md     Architecture and API documentation
`-- MONTA_FOAM_BUG_REPORT.md
```

## Local development

Requirements: Node.js 22+, npm, and PostgreSQL when using the Express API.

### Web application

```bash
cd "Monta Foam-frontend"
cp .env.local.example .env.local
npm ci
npm run dev
```

Open <http://localhost:3000>. During local Next.js development, set `NEXT_PUBLIC_API_URL` to the Express API URL.

### Express API

```bash
cd "Monta Foam-backend"
cp .env.example .env
npm ci
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

The API runs at <http://localhost:5000>; Swagger documentation is available at <http://localhost:5000/api-docs>.

PostgreSQL can also be started together with the API by running `docker compose up --build` in the backend directory.

## Quality checks

Run the following commands in each package before opening a pull request:

```bash
npm run lint
npm run build
```

GitHub Actions runs the same checks automatically for pushes and pull requests to `main`.

## Deployment

- Cloudflare: the frontend package contains a Vinext build, a Hono Worker API, and a D1 migration. Configure Worker secrets outside Git before deployment.
- Node.js: deploy the frontend and Express API separately, then point `NEXT_PUBLIC_API_URL` at the public API endpoint.

Never commit `.env` files or production credentials. The repository contains example files with placeholders only.

## Documentation

- [Complete architecture and API reference](MONTA_FOAM_DOCS.md)
- [Review and recovery report](MONTA_FOAM_BUG_REPORT.md)
- [Frontend notes](Monta%20Foam-frontend/README.md)
- [Backend setup and security notes](Monta%20Foam-backend/README.md)
