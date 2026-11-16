# DIANO Admin Portal — Production Deployment Guide

## 1. Overview & Architecture

`diano-admin` is the high-security administrative portal for DIANO E-Commerce built with **Next.js 16 (App Router)**, React 19, TypeScript, Tailwind CSS, TanStack Query, and Redux Toolkit.

### Architectural Core
- **BFF (Backend-For-Frontend) Authentication**: Silent refresh and administrative session initialization occur via Next.js Route Handlers (`/api/auth/*`). The HttpOnly `diano_refresh_token` cookie is bound to the Admin frontend origin with `SameSite=Lax; Secure; HttpOnly`.
- **Direct Authorized API Gateway**: Data fetching operations utilize in-memory JWT Bearer tokens to communicate with `diano-server` directly via `NEXT_PUBLIC_API_BASE_URL`.
- **Timezone Standardization**: All dashboard metrics, period boundaries, and financial summaries resolve strictly to `Asia/Dhaka` (UTC+6) standard time.

---

## 2. Production Environment Variables

Configure the following environment variables in your deployment platform (Vercel, Render, Railway, or Docker):

| Variable | Scope | Required | Description | Example (Production) |
|---|---|---|---|---|
| `NODE_ENV` | Build & Runtime | Yes | Node runtime mode | `production` |
| `NEXT_PUBLIC_APP_URL` | Browser & Server | Yes | Canonical public URL of the Admin Portal | `https://admin.diano.com.bd` |
| `BACKEND_API_URL` | Server Only | Yes | Internal upstream origin for BFF Route Handlers (never exposed to browser bundles) | `https://api.diano.com.bd` |
| `NEXT_PUBLIC_API_BASE_URL` | Browser & Server | Yes | Base URL for REST API calls | `https://api.diano.com.bd/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL` | Browser & Server | Yes | Real-time WebSocket / Socket.IO server origin | `https://api.diano.com.bd` |

> [!SECURITY]
> `BACKEND_API_URL` is accessible **only** within Server Components and Next.js Route Handlers. Never prefix internal upstream API keys or database URLs with `NEXT_PUBLIC_`.

---

## 3. Platform Deployment Guides

### Option A: Vercel (Recommended)
1. Import repository `diano-admin` into Vercel.
2. Select Framework Preset: **Next.js**.
3. Set the Root Directory to `diano-admin` (if deployed from a monorepo).
4. Configure Build and Output Settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. In **Settings -> Environment Variables**, configure all 5 variables listed in Section 2.
6. Trigger production deployment.

### Option B: Render / Railway / Docker
For containerized deployments or PaaS environments:
1. Build Command: `npm run build`
2. Start Command: `npm run start -- -p $PORT`
3. Health Check Path: `/api/health`
4. Set Auto-Deploy on `main` branch push.

---

## 4. CORS & Cookie Policies

### Upstream `diano-server` CORS Settings
Ensure `diano-server` allows the admin domain in its `ALLOWED_ORIGINS` configuration:
```env
ALLOWED_ORIGINS=https://admin.diano.com.bd,https://diano.com.bd
```
Backend response headers must include:
- `Access-Control-Allow-Origin: https://admin.diano.com.bd`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Authorization, Content-Type, Idempotency-Key, x-request-id`

### Cookie Security
When running on `https://admin.diano.com.bd`:
- The `diano_refresh_token` cookie created by `/api/auth/admin/login` automatically inherits `SameSite=Lax; Secure; HttpOnly; Path=/`.
- If the frontend and backend share a parent domain (e.g. `admin.diano.com.bd` and `api.diano.com.bd`), cookie scope can optionally specify `Domain=.diano.com.bd`.

---

## 5. Security & Content Security Policy (CSP)

`next.config.ts` enforces strict HTTP headers across all 36 routes:
- **Content-Security-Policy (CSP)**:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' data: blob: https://res.cloudinary.com`
  - `connect-src 'self' https://res.cloudinary.com <BACKEND_ORIGIN> <SOCKET_ORIGIN>`
  - `frame-ancestors 'none'` (prevents clickjacking)
- **X-Frame-Options**: `DENY`
- **X-Content-Type-Options**: `nosniff`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: `camera=(), microphone=(), geolocation=()`

---

## 6. Health Checks & Monitoring

The portal provides a lightweight, unauthenticated health endpoint for load balancers and container orchestrators:

- **Endpoint**: `GET /api/health`
- **Expected Status**: `200 OK`
- **Response Format**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "DIANO Admin frontend is healthy",
  "data": {
    "status": "UP",
    "app": "diano-admin",
    "timezone": "Asia/Dhaka"
  },
  "timestamp": "2026-11-16T04:30:00.000Z"
}
```

---

## 7. Pre-Launch Verification Checklist

Before opening DNS traffic to production:
- [ ] Run `npm run typecheck` — 0 errors.
- [ ] Run `npm run lint` — 0 warnings, 0 errors.
- [ ] Run `npm test` — all Vitest suites passing.
- [ ] Run `npx playwright test` — all 14 E2E critical flows passing.
- [ ] Verify `GET /api/health` returns HTTP 200 `UP`.
- [ ] Verify SSL certificate is valid with HSTS enabled.
- [ ] Verify Cloudinary asset loading in product catalog and CMS banners.
- [ ] Confirm account lockout handling after 5 failed login attempts.
- [ ] Confirm staff RBAC restricts access according to role permissions.
