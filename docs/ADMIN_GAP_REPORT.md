# DIANO Admin Dashboard — Phase 1 Inspection & Gap Report (`ADMIN_GAP_REPORT.md`)

**Generated:** 2026-11-11
**Scope:** Read-only verification of `diano-admin` against `../diano-server/openapi.json` (253 operations), `FRONTEND_HANDOFF.md`, `API_CONTRACT.md`, `SCHEMA_SUMMARY.md`, `ANALYTICS_DEFINITIONS.md`, `prisma/seed.ts`, and `src/sockets/`.

---

## 1. Real Workspace & Route Audit (`diano-admin`)

All 31 App Router routes in `diano-admin` currently compile and pass static/dynamic build generation, but **all UI pages are Phase 1 `<RoutePlaceholder />` scaffolds** (0 functional business screens implemented yet).

| Route Path | Type | Current Frontend State | Functional vs Scaffold |
| :--- | :--- | :--- | :--- |
| `/` | Static Page | **Scaffold** | Links to `/admin` and `/login` |
| `/login` | Static Page | **Scaffold** | `<RoutePlaceholder />` (no login form wired yet) |
| `/forgot-password` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/reset-password` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/verify-email` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin` | Static Page | **Scaffold** | `<RoutePlaceholder />` (no shell/KPIs yet) |
| `/admin/analytics` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/products` | Static Page | **Scaffold** | `<RoutePlaceholder />` (`features/products` has base GET helpers only) |
| `/admin/categories` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/inventory` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/suppliers` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/purchases` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/orders` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/abandoned-checkouts` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/customers` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/payments` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/fraud-detection` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/coupons` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/flash-sales` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/shipping` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/returns` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/refunds` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/reviews` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/reports` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/notifications` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/cms` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/staff` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/roles-permissions` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/audit-logs` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/admin/settings` | Static Page | **Scaffold** | `<RoutePlaceholder />` |
| `/api/health` | Dynamic Route Handler | **Functional** | Returns `{ status: 'ok', service: 'diano-admin' }` |
| `/api/auth/[...action]` | Dynamic Route Handler | **Functional** | Allowlisted BFF proxy (`admin/login`, `refresh`, `logout`, `logout-all`, `me`) |
| `src/proxy.ts` | Next.js 16 Proxy | **Functional** | Optimistic `diano_refresh_token` check + `returnUrl` sanitizer |

> **Missing Route Segments for Sidebar Spec:** `/admin/inventory/audits` (Stock Audit) and `/admin/expenses` (Operating Expenses) need dedicated route pages or tabs in Phase 2/5/8.

---

## 2. Permission Slugs Audit (`diano-admin` vs `diano-server/prisma/seed.ts`)

- **`diano-server/prisma/seed.ts` (`permissionsData`):** Seeds **72** permission slugs.
- **`diano-admin/src/constants/permissions.ts` (`PERMISSIONS`):** Defines **73** permission slugs.
- **Exact Differences Found:**
  1. **Present in `seed.ts` (line 87) but MISSING in `diano-admin/src/constants/permissions.ts`:**
     - `fraud:rule_manage` (`Manage Fraud Rules Legacy` — checked alongside `fraud:manage` in `diano-server/src/modules/fraud-detection/fraud.routes.ts`).
  2. **Present in `diano-admin/src/constants/permissions.ts` (and checked in `diano-server/src/modules/customers/customers.routes.ts` lines 30–35) but NOT seeded in `diano-server/prisma/seed.ts`:**
     - `customer:read`
     - `customer:manage`
     *(Impact: In `diano-server`, `customers.routes.ts` requires `customer:read` / `customer:manage`. Since `seed.ts` assigns all seeded permissions to `super-admin` and `admin`, non-super-admin staff roles will receive `403` on `/api/v1/customers` unless `customer:read`/`customer:manage` exist in DB or `super-admin` bypasses via `permissionsCache`.)*
  3. **Role-to-Permission Resolution Gap on `GET /api/v1/auth/me`:**
     - `diano-server/src/modules/auth/auth.service.ts` (`formatUserSummary`) returns `{ id, email, name, phone, avatarUrl, roles: string[] }` and **omits `permissions: string[]`**.
     - Furthermore, `seed.ts` only seeds `rolePermission` rows for `super-admin`, `admin`, `manager`, and `order-manager` (lines 198–270); `inventory-manager` and `support-staff` have 0 rows seeded in `seed.ts`.

---

## 3. Environment, API Client & Refresh Logic Verification

| Area | Current State in `diano-admin` | Contract / Phase 2–3 Alignment Required |
| :--- | :--- | :--- |
| **Env Variable Naming** | `src/config/env.ts` validates `NEXT_PUBLIC_API_BASE_URL` (`http://localhost:5000/api/v1`) and `BACKEND_API_URL` (`http://localhost:5000`). | Add support for `NEXT_PUBLIC_API_URL` (auto-appending `/api/v1` when needed) so both `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_API_BASE_URL` work seamlessly. |
| **Access Token Storage** | Stored in module memory (`src/lib/auth/token-store.ts`), never `localStorage`/`sessionStorage`. | Sync auth state into Redux (`auth.slice.ts`) in Phase 3 while keeping token strictly in memory. |
| **401 Refresh Queue** | `src/lib/api/browser-client.ts` queues concurrent 401s (`isRefreshing` + `pendingQueue`). | Currently calls `${NEXT_PUBLIC_API_BASE_URL}/auth/refresh` directly and does not redirect on failure; in Phase 3, route through `/api/auth/refresh` (or unified origin) and trigger logout + redirect to `/login?returnUrl=...` on failure. |
| **Render Cold-Start Handling** | Axios timeout is fixed at `20000ms` (20s); TanStack Query retries GETs up to 2 times. | Increase initial/cold-start timeout to `65000ms` (~65s) in Phase 3/4 with a `"Server is waking up..."` indicator and backoff retries for `GET` only (`mutations.retry = false`). |
| **OpenAPI Type Generation** | Hand-written base types in `src/types/`. | Add `api:types` script generating `src/lib/api/schema.d.ts` from `../diano-server/openapi.json`. |

---

## 4. Screen-by-Screen Implementation vs Backend API Availability Matrix

| Screen / Feature | Frontend Status | Backend API Status | Primary Backend Endpoints Verified in `openapi.json` |
| :--- | :--- | :--- | :--- |
| **Auth: Login / Logout / Refresh / Me** | Scaffold | **Available** (with `/auth/me` permissions caveat) | `POST /auth/admin/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/logout-all`, `GET /auth/me`, `GET /auth/login-history` |
| **Dashboard Overview (12 KPIs)** | Scaffold | **Verify / Partial** (split across 3 endpoints) | `GET /admin/analytics/overview`, `GET /admin/analytics/revenue`, `GET /inventory/summary` (`Delivered Sales` KPI missing from overview; see `BACKEND_GAPS.md`) |
| **Analytics & Charts** | Scaffold | **Partial** (8 chart types available; 2 missing) | `GET /admin/analytics/{overview,revenue,orders,products,inventory,customers,payments,funnel}`, `GET /admin/analytics/charts/{type}` |
| **Products & Image Slots** | Scaffold | **Available** | `GET /products/admin/all`, `GET /products/admin/form-options`, `GET /products/admin/{id}`, `POST /products`, `PATCH /products/{id}`, `PATCH /products/{id}/status`, `POST /products/{id}/images/{thumbnail,backview,gallery}`, `PUT /products/{id}/images/reorder` |
| **Categories & Spec Templates** | Scaffold | **Available** | `GET /categories/admin/all`, `GET /categories/admin/{id}`, `GET /categories/{id}/product-form-schema`, `POST /categories`, `PATCH /categories/{id}`, `PUT /categories/reorder`, `PATCH /categories/{id}/specification-template`, `POST/PATCH /categories/{id}/image` |
| **Inventory & Movements Ledger** | Scaffold | **Available** | `GET /inventory`, `GET /inventory/summary`, `GET /inventory/low-stock`, `GET /inventory/movements`, `GET /inventory/variant/{variantId}`, `POST /inventory/{receive,adjust,damage,transfer}` |
| **Stock Audits** | Scaffold | **Available** | `GET /inventory/audits`, `GET /inventory/audits/{id}`, `POST /inventory/audits`, `POST /inventory/audits/{id}/{counts,approve,reject}` |
| **Suppliers & Purchase Orders** | Scaffold | **Available** | `GET/POST /suppliers`, `GET/PATCH/DELETE /suppliers/{id}`, `GET/POST /purchase-orders`, `GET /purchase-orders/{id}`, `PATCH /purchase-orders/{id}/status`, `POST /purchase-orders/{id}/receive` |
| **Orders & Invoice PDF** | Scaffold | **Available** | `GET /admin/orders`, `GET /admin/orders/{id}`, `GET /admin/orders/{id}/timeline`, `PATCH /admin/orders/{id}/status`, `POST /admin/orders/{id}/notes`, `GET /admin/orders/{id}/invoice` |
| **Abandoned Checkouts** | Scaffold | **Available** | `GET /abandoned-checkouts`, `GET /abandoned-checkouts/stats`, `GET /abandoned-checkouts/{id}`, `POST /abandoned-checkouts/{id}/recovery` |
| **Customers** | Scaffold | **Available** (note `customer:read` seed gap) | `GET /customers`, `GET /customers/{id}`, `PATCH /customers/{id}/status`, `GET/POST /customers/{id}/notes`, `GET /customers/{id}/timeline` |
| **Payments & COD Collection** | Scaffold | **Available** | `GET /admin/payments`, `GET /admin/payments/{id}`, `POST /admin/payments/{id}/mark-cod-collected`, `POST /admin/payments/{id}/refund` |
| **Fraud Rules & Review Queue** | Scaffold | **Available** | `GET /admin/fraud/rules`, `PATCH /admin/fraud/rules/{key}`, `GET /admin/fraud/stats`, `GET /admin/fraud/reviews`, `GET /admin/fraud/reviews/{id}`, `POST /admin/fraud/reviews/{id}/{approve,reject,request-otp,verify-otp}` |
| **Shipping Zones, Methods & Shipments** | Scaffold | **Available** | `GET/POST /admin/shipping/zones`, `GET/PATCH/DELETE /admin/shipping/zones/{id}`, `GET/POST /admin/shipping/methods`, `PATCH/DELETE /admin/shipping/methods/{id}`, `GET/POST /admin/orders/{id}/shipments`, `PATCH /admin/shipments/{id}/status` |
| **Returns & Refunds** | Scaffold | **Available** | `GET /admin/returns`, `GET /admin/returns/{id}`, `POST /admin/returns/{id}/{review,receive,refund}`, `GET /admin/refunds`, `GET /admin/refunds/{id}`, `POST /admin/refunds/orders/{id}/refunds`, `POST /admin/refunds/returns/{id}/refund` |
| **Coupons & Flash Sales** | Scaffold | **Partial** (Flash Sales has POST & public GET only) | `GET/POST /admin/coupons`, `GET/PATCH/DELETE /admin/coupons/{id}`, `POST /admin/flash-sales`, `GET /flash-sales` |
| **Reviews Moderation** | Scaffold | **Missing** | `src/modules/reviews` contains `.gitkeep` only — 0 endpoints in `openapi.json` |
| **Reports & Exports** | Scaffold | **Partial** (5 report POSTs exist; products/payments/expenses export endpoints missing) | `POST /admin/reports/{orders,sales,inventory,customers,financial}` |
| **Operating Expenses** | Scaffold | **Available** | `GET/POST /admin/expenses`, `GET/PUT/PATCH/DELETE /admin/expenses/{id}` |
| **Notifications Inbox & Outbox** | Scaffold | **Available** | `GET /admin/notifications`, `POST /admin/notifications/{id}/retry`, `GET /notifications`, `PATCH /notifications/{id}/read`, `PATCH /notifications/read-all` |
| **CMS (Settings, Banners, Pages)** | Scaffold | **Available** | `GET/PATCH /settings/{group}`, `POST /settings/{logo,favicon}`, `GET/POST /banners`, `GET/PUT/DELETE /banners/{id}`, `PATCH /banners/{id}/toggle`, `PUT /banners/reorder`, `GET/POST /pages`, `GET/PUT/DELETE /pages/{id}`, `POST /pages/{id}/{publish,unpublish}`, `GET /pages/{id}/revisions`, `POST /pages/{id}/revisions/{version}/restore` |
| **Staff, Roles & Permissions** | Scaffold | **Available** | `GET/POST /users`, `GET/PATCH/DELETE /users/{id}`, `PATCH /users/{id}/status`, `POST /users/{id}/revoke-sessions`, `GET/POST /roles`, `GET/PATCH/DELETE /roles/{id}`, `PUT /roles/{id}/permissions`, `GET /permissions` |
| **Audit Logs** | Scaffold | **Missing** | `src/modules/audit-logs` contains `.gitkeep` only — 0 endpoints in `openapi.json` |

---

## 5. Confirmed Known Mismatches & Architectural Constraints

1. **Fraud Risk Levels (`LOW | MEDIUM | HIGH` only):** Confirmed in `diano-server/prisma/schema.prisma` and `src/modules/fraud-detection/fraud.types.ts` (`FraudStats`: `lowRiskCount`, `mediumRiskCount`, `highRiskCount`). There is **no `CRITICAL`** risk level.
2. **Missing Backend Modules (`Reviews`, `Audit Logs`, `Active Sessions List`):**
   - `diano-server/src/modules/reviews/` and `diano-server/src/modules/audit-logs/` contain only `.gitkeep`.
   - No `GET /auth/sessions` or `GET /users/:id/sessions` endpoint exists (only `GET /auth/login-history` and `POST /users/:id/revoke-sessions` exist).
3. **Analytics Chart Types (`GET /api/v1/admin/analytics/charts/{type}`):**
   - Confirmed in `analytics.validation.ts`: only `sales-trend`, `orders-trend`, `profit-trend`, `payment-method-pie`, `order-status-pie`, `top-categories-bar`, `hourly-heatmap`, and `district-choropleth-data` exist.
   - **Shipment-status distribution** and **stock-by-subcategory** chart endpoints do **not** exist.
4. **Environment-Driven Secrets (Payment & Email Credentials):**
   - SSLCOMMERZ, SMTP/Email, Cloudinary, and JWT secrets are configured solely via environment variables on Render. `GET/PATCH /api/v1/settings/{group}` only supports `store_profile`, `invoice`, `seo_defaults`, and `contact`. The Settings UI must display read-only configuration status for env-driven integrations and never render secret inputs.
5. **Fixed Regional Standards:** Currency is fixed to **BDT (`৳`)** and timezone is fixed to **`Asia/Dhaka` (`UTC+06:00`)**.

