# DIANO Backend Gaps & Contract Discrepancies (`BACKEND_GAPS.md`)

**Updated:** 2026-11-11 (Post Backend Patch Sync)
**Purpose:** Authoritative registry of backend endpoints, fields, or permissions that are absent or differ between documentation (`FRONTEND_HANDOFF.md` / `API_CONTRACT.md` / `ANALYTICS_DEFINITIONS.md`) and the live `diano-server` implementation (`openapi.json` 255 operations + `src/`).

> **Frontend Rule:** Never invent endpoints, fake data, or simulate unsupported operations. Every gap listed below must either use the documented real alternative endpoint or render an honest `"Not available yet"` / read-only state in `diano-admin`.

---

## 1. Resolved / Closed Backend Gaps (Backend Patch Complete)

| # | Feature / Screen | Resolved Capability in Backend | Status |
| :--- | :--- | :--- | :--- |
| **BG-01** | **Reviews Moderation** (`/admin/reviews`) | `GET /api/v1/admin/reviews`<br>`GET /api/v1/admin/reviews/:id`<br>`PATCH /api/v1/admin/reviews/:id/status`<br>`DELETE /api/v1/admin/reviews/:id` fully implemented, mounted, and covered in OpenAPI. | **CLOSED** ✅ |
| **BG-02** | **Audit Logs Viewer** (`/admin/audit-logs`) | `GET /api/v1/admin/audit-logs`<br>`GET /api/v1/admin/audit-logs/:id` read-only append-only audit query endpoints implemented, mounted, and covered in OpenAPI. | **CLOSED** ✅ |
| **BG-04** | **Charts Distribution** | `GET /api/v1/admin/analytics/charts/shipment-status`<br>`GET /api/v1/admin/analytics/charts/stock-by-subcategory` added to allowed chart types and implemented. | **CLOSED** ✅ |
| **BG-05** | **Dashboard KPI:** `deliveredSales` | `cards.deliveredSales` added to `GET /api/v1/admin/analytics/overview` comparative KPI cards. | **CLOSED** ✅ |
| **BG-10** | **`GET /api/v1/auth/me` Response** | `permissions: string[]` (effective granular slugs) and `isSuperAdmin: boolean` now returned directly in `/auth/me`, login, register, and refresh payloads. | **CLOSED** ✅ |
| **BG-11** | **Customer Route Permissions** | `customer:read` and `customer:manage` seeded in `seed.ts` and mapped to `ADMIN`, `MANAGER`, and `SUPPORT_STAFF`. `fraud:rule_manage` unified to `fraud:manage`. | **CLOSED** ✅ |

---

## 2. Active / Open Backend Gaps (Render Honest Frontend Fallback)

| # | Feature / Screen Affected | Open Gap / Alternative Endpoint | Frontend Handling Strategy |
| :--- | :--- | :--- | :--- |
| **BG-03** | **Active Device Sessions List** (`/admin/settings`, `/admin/staff/:id`) | No active session query endpoint (`GET /api/v1/auth/sessions`). `GET /api/v1/auth/login-history` and revocation endpoints exist. | Show recent login history via `GET /api/v1/auth/login-history` and provide `"Revoke All Sessions"` via `POST /api/v1/auth/logout-all` / `POST /api/v1/users/:id/revoke-sessions`. |
| **BG-06** | **Flash Sales Admin Management** (`/admin/flash-sales`) | `POST /api/v1/admin/flash-sales` (create) and public `GET /api/v1/flash-sales` (active list) exist; admin list-all, update, or delete routes do not exist. | List active campaigns via `GET /api/v1/flash-sales` and create campaigns via `POST /api/v1/admin/flash-sales`; disable edit/delete actions with `"Not available in backend API"`. |
| **BG-07** | **Reports Export:** Standalone Products, Payments & Expenses (`/admin/reports`) | Standalone file export endpoints do not exist; `reports.routes.ts` supports `POST /api/v1/admin/reports/{orders,sales,inventory,customers,financial}`. | Enable CSV/XLSX/PDF export for the 5 supported domains; mark standalone `products`, `payments`, and `expenses` exports as `"Included in Financial/Inventory/Sales reports — standalone export not available"`. |
| **BG-08** | **Category Reorder Method & Path** (`/admin/categories`) | `PUT /api/v1/categories/reorder` is exposed (not `PATCH`). | Use `PUT /api/v1/categories/reorder`. |
| **BG-09** | **Abandoned Checkout Recovery Path** (`/admin/abandoned-checkouts`) | `POST /api/v1/abandoned-checkouts/:id/recovery` is exposed (not `/recover`). | Use `POST /api/v1/abandoned-checkouts/:id/recovery`. |
| **BG-12** | **Unseeded System Roles in `seed.ts`** | `inventory-manager` and `support-staff` role rows are not seeded by default unless assigned via Roles & Permissions. | Documented in Roles & Permissions screen so custom/staff roles can be assigned permissions via `PUT /api/v1/roles/:id/permissions`. |
| **BG-13** | **KPI Card Shape (`/admin/analytics/overview`)** | `analytics.types.ts` returns `{ current, previous, change, percent, trend: 'UP'\|'DOWN'\|'FLAT'\|'NONE', unit, note }`. | Normalize KPI card shape in frontend adapter. Render `"—"` when `percent` is `null`. |
| **BG-14** | **Analytics Numbers vs Decimal Strings** | Mixed: `number` in analytics aggregations, Decimal `string`s in transactional models (`Order`, `ProductVariant`, etc.). | Shared `MoneyText` / `formatBdt()` utility safely formats `string \| number` using `Intl.NumberFormat('en-BD')` without floating-point math in the UI. |
| **BG-15** | **Socket.IO Event Names** | Real event names emitted by backend: `order:new`, `order:status`, `payment:status`, `stock:low`, `checkout:abandoned`, `fraud:review`, `notification:new`. | Listen strictly to the 7 real backend Socket.IO events. |
| **BG-16** | **Fraud Risk Tiers** | Prisma `FraudRiskLevel` has only `LOW`, `MEDIUM`, `HIGH`. | Render badges and filters strictly for `LOW`, `MEDIUM`, and `HIGH`. |
| **BG-17** | **Notifications Unread Count Endpoint** (`/admin`, topbar bell) | No dedicated `GET /api/v1/notifications/unread-count` endpoint or real-time `notification:unread_count` event exists in `diano-server`. Backend provides `GET /api/v1/notifications` and emits `notification:new` on event bus. | Topbar bell indicator listens to real-time `notification:new` events to toggle unread alert badge, clearing on click. Full notification history is fetched from `GET /api/v1/notifications`. |
| **BG-18** | **Account Lockout Structured Retry Info** (`POST /api/v1/auth/admin/login`) | Backend lockout response returns HTTP 403 with lockout duration embedded strictly inside string `message` (`"Try again in X minute(s)."`), without a structured `retryAfterSeconds` or `retryAfterMinutes` number field. | Frontend `formatLockoutMessage` uses a regex fail-safe extractor, defaulting to a clean generic message if parsing fails. |
| **BG-19** | **Product Concurrency & Versioning** (`PATCH /api/v1/products/:id`) | Product updates use last-write-wins semantics without optimistic concurrency locking or version checks (`version` / `updatedAt` guard). | Frontend uses dirty form guards and disables double submissions to mitigate race conditions. |
| **BG-20** | **Product Create & Media Slots Sequence** (`POST /products` & `POST /products/:id/images/*`) | Product creation requires at least one variant upfront but image slot uploads require an existing `productId`. | Frontend provides a seamless two-step flow: create product with initial variants and pricing first, then immediately unlocks the media slots tab on the created product. |
| **BG-21** | **Standalone Warehouses List Endpoint** (`/admin/inventory`, `/admin/purchases`) | No standalone `GET /api/v1/warehouses` endpoint exists. Warehouse records are embedded inside `InventoryEntity`, `PurchaseOrderEntity`, and `StockAuditEntity`. | Frontend extracts unique warehouses from inventory query cache with graceful fallback to manual ID entry (e.g. default `Central Warehouse Dhaka`). |

