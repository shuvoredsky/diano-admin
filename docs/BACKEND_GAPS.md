# DIANO Backend Gaps & Contract Discrepancies (`BACKEND_GAPS.md`)

**Generated:** 2026-11-11
**Purpose:** Authoritative registry of backend endpoints, fields, or permissions that are absent or differ between documentation (`FRONTEND_HANDOFF.md` / `API_CONTRACT.md` / `ANALYTICS_DEFINITIONS.md`) and the live `diano-server` implementation (`openapi.json` + `src/`).

> **Frontend Rule:** Never invent endpoints, fake data, or simulate unsupported operations. Every gap listed below must either use the documented real alternative endpoint or render an honest `"Not available yet"` / read-only state in `diano-admin`.

---

## 1. Missing Endpoints (Render Honest `"Not Available Yet"` State)

| # | Feature / Screen Affected | Missing Endpoint(s) | Backend Evidence | Frontend Handling Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **BG-01** | **Reviews Moderation** (`/admin/reviews`) | `GET /api/v1/admin/reviews`<br>`PATCH /api/v1/admin/reviews/:id/status`<br>`DELETE /api/v1/admin/reviews/:id` | `diano-server/src/modules/reviews/` contains only `.gitkeep`; not mounted in `src/routes/index.ts`. | Render `<EmptyState />` / `"Reviews moderation API is not available in the backend yet"` on `/admin/reviews`. |
| **BG-02** | **Audit Logs Viewer** (`/admin/audit-logs`) | `GET /api/v1/admin/audit-logs`<br>`GET /api/v1/admin/audit-logs/:id` | `AuditLog` Prisma model & internal `auditService.record()` exist, but `src/modules/audit-logs/` has only `.gitkeep` and no HTTP route. | Render `"Audit Logs query endpoint is not available in the backend yet"` on `/admin/audit-logs`. |
| **BG-03** | **Active Device Sessions List** (`/admin/settings`, `/admin/staff/:id`) | `GET /api/v1/auth/sessions`<br>`DELETE /api/v1/auth/sessions/:sessionId` | `auth.routes.ts` exposes `GET /api/v1/auth/login-history`, `POST /api/v1/auth/logout-all`, and `POST /api/v1/users/:id/revoke-sessions`, but no active session list endpoint. | Show recent login history via `GET /api/v1/auth/login-history` and provide `"Revoke All Sessions"` via `POST /api/v1/auth/logout-all` / `POST /api/v1/users/:id/revoke-sessions`. |
| **BG-04** | **Dashboard / Analytics Charts:** Shipment Status Distribution & Stock by Subcategory | `GET /api/v1/admin/analytics/charts/shipment-status`<br>`GET /api/v1/admin/analytics/charts/stock-by-subcategory` | `chartTypeEnum` in `analytics.validation.ts` allows only: `sales-trend`, `orders-trend`, `profit-trend`, `payment-method-pie`, `order-status-pie`, `top-categories-bar`, `hourly-heatmap`, `district-choropleth-data`. | Use the 8 supported chart types; render honest `"Not available yet"` card if shipment-status or subcategory stock breakdown is requested. |
| **BG-05** | **Dashboard KPI:** `Delivered Sales` (Comparative KPI Card) | `cards.deliveredSales` in `GET /api/v1/admin/analytics/overview` | `ANALYTICS_DEFINITIONS.md` §3.6 defines `deliveredSales`, but `analytics.service.ts` (`getOverview`) returns 12 cards: `grossSales`, `netSales`, `totalOrders`, `aov`, `itemsSold`, `cancellationRate`, `returnRate`, `customerCount`, `repeatCustomerRate`, `grossProfit`, `netProfit`, `undeliveredOrdersCount`. | Compose the 12 Dashboard KPI cards from `GET /admin/analytics/overview` + `GET /admin/analytics/revenue` (`discounts.total`) + `GET /inventory/summary` (`totalProducts`, `totalStockUnits`, `stockValue`, `damaged`, `damageValue`, `netStockValue`), and display `"Not available"` for `Delivered Sales` (or show `completedOrders` count from `/admin/analytics/orders` with clear label). |
| **BG-06** | **Flash Sales Admin Management** (`/admin/flash-sales`) | `GET /api/v1/admin/flash-sales`<br>`PATCH /api/v1/admin/flash-sales/:id`<br>`DELETE /api/v1/admin/flash-sales/:id` | `coupons.routes.ts` mounts `POST /api/v1/admin/flash-sales` (create) and public `GET /api/v1/flash-sales` (list active), but no admin list-all, update, or delete routes. | List active flash sales via `GET /api/v1/flash-sales` and allow creating campaigns via `POST /api/v1/admin/flash-sales`; disable edit/delete actions with `"Not available in backend API"`. |
| **BG-07** | **Reports Export:** Products, Payments & Expenses Exports (`/admin/reports`) | `POST /api/v1/admin/reports/products`<br>`POST /api/v1/admin/reports/payments`<br>`POST /api/v1/admin/reports/expenses` | `reports.routes.ts` only implements `POST /api/v1/admin/reports/{orders,sales,inventory,customers,financial}`. | Enable CSV/XLSX/PDF export for `orders`, `sales`, `inventory`, `customers`, and `financial`; mark standalone `products`, `payments`, and `expenses` file exports as `"Included in Financial/Inventory/Sales reports — standalone export not available"`. |
| **BG-08** | **Category Reorder Method & Path** (`/admin/categories`) | `PATCH /api/v1/categories/reorder` (listed in `FRONTEND_HANDOFF.md`) | `openapi.json` & `categories.routes.ts` actually expose `PUT /api/v1/categories/reorder`. | Use `PUT /api/v1/categories/reorder`. |
| **BG-09** | **Abandoned Checkout Recovery Path** (`/admin/abandoned-checkouts`) | `POST /api/v1/abandoned-checkouts/:id/recover` (listed in `FRONTEND_HANDOFF.md`) | `openapi.json` & `abandoned-checkout.routes.ts` actually expose `POST /api/v1/abandoned-checkouts/:id/recovery`. | Use `POST /api/v1/abandoned-checkouts/:id/recovery`. |

---

## 2. Permission & RBAC Contract Discrepancies

| # | Area | Discrepancy | Impact & Frontend Mitigation |
| :--- | :--- | :--- | :--- |
| **BG-10** | **`GET /api/v1/auth/me` Response Payload** | `formatUserSummary()` in `auth.service.ts` returns `{ id, email, name, phone, avatarUrl, roles: string[] }` and does **not** include `permissions: string[]`. Meanwhile `GET /api/v1/roles` requires `role:read`. | In `diano-admin`, if `user.permissions` is absent on `/auth/me`, derive permissions for built-in system roles from the canonical `seed.ts` role-permission matrix (and query `GET /api/v1/roles` when the user has `role:read`), while always handling backend `403 Forbidden` responses gracefully. |
| **BG-11** | **Customer Route Permissions (`customer:read`, `customer:manage`)** | `customers.routes.ts` guards `/api/v1/customers/*` with `requirePermission('customer:read')` and `requirePermission('customer:manage')`, but neither slug is in `prisma/seed.ts` (`permissionsData`). | Super Admin and Admin bypass/satisfy checks, while other roles may receive `403` on `/api/v1/customers`. Frontend must handle `403` on Customer screens with a clear permission notice. |
| **BG-12** | **Unseeded System Roles in `seed.ts`** | `seed.ts` seeds `rolePermission` mappings for `super-admin`, `admin`, `manager`, and `order-manager`, but does not seed rows for `inventory-manager` or `support-staff` unless assigned via `/admin/roles-permissions`. | Documented for admins in Roles & Permissions screen so custom/staff roles can be assigned permissions via `PUT /api/v1/roles/:id/permissions`. |

---

## 3. Payload & Enum Shape Discrepancies

| # | Area | Doc Description | Actual Backend Code (`src/`) | Frontend Implementation Rule |
| :--- | :--- | :--- | :--- | :--- |
| **BG-13** | **KPI Card Shape (`/admin/analytics/overview`)** | `ANALYTICS_DEFINITIONS.md`: `{ current, previous, absoluteChange, percentageChange, trend: 'up'\|'down'\|'flat' }` | `analytics.types.ts`: `{ current, previous, change, percent, trend: 'UP'\|'DOWN'\|'FLAT'\|'NONE', unit, note }` | Normalize both shapes in the analytics adapter (`percent ?? percentageChange`, `change ?? absoluteChange`, case-insensitive `trend`). Render `"—"` when `percent` is `null`. |
| **BG-14** | **Analytics Numbers vs Decimal Strings** | `API_CONTRACT.md` §3 states money is 2-decimal strings; `analytics.types.ts` returns `number` for analytics aggregates while orders/products/inventory return Decimal `string`s. | Mixed (`number` in analytics, `string` in transactional models). | Shared `formatBdt()` utility safely formats `string \| number` using `Intl.NumberFormat('en-BD')` without floating-point arithmetic in the UI. |
| **BG-15** | **Socket.IO Event Names** | `FRONTEND_HANDOFF.md` lists `order:created`, `order:status_changed`, `stock:low_alert`, `fraud:held_alert`, `notification:in_app`. | `socket.server.ts` actually emits: `order:new`, `order:status`, `payment:status`, `stock:low`, `checkout:abandoned`, `fraud:review`, `notification:new`. | Listen strictly to the 7 real event names from `socket.server.ts`. |
| **BG-16** | **Fraud Risk Tiers** | Some UI specs mention `Critical`. | Prisma `FraudRiskLevel` has only `LOW`, `MEDIUM`, `HIGH`. | Render badges and filters strictly for `LOW`, `MEDIUM`, and `HIGH`. |

