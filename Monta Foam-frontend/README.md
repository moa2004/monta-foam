# Monta Foam — Web

Arabic RTL website and administration dashboard built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and React Query. The package also contains the Cloudflare Worker API built with Hono and D1.

## Local setup

1. Copy `.env.local.example` to `.env.local` and fill in the required public values. For local Next.js development, point `NEXT_PUBLIC_API_URL` at the Express API.
2. Install and verify the app:

```bash
npm ci
npm run lint
npm run build
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API defaults to `http://localhost:5000/api/v1`.

## Main routes

- Public: `/`, `/services`, `/about`, `/contact`
- Authentication: `/auth/login`, `/auth/register`, `/auth/verify`, `/auth/forgot-password`
- Admin: `/dashboard`, `/dashboard/requests`, `/dashboard/users`, `/dashboard/notifications`, `/dashboard/content`

The dashboard is protected client-side and every dashboard API call is protected again by backend RBAC.

## Production checks

```bash
npm run lint
npm run build
npm audit
npm start
```

For the Cloudflare deployment, use `npm run build:site` and configure D1 plus Worker secrets outside Git. For a split deployment, set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, and the Google client ID to the production values.
