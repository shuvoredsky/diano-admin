# DIANO Admin Dashboard — Project Progress (`PROJECT_PROGRESS.md`)

**Last Updated:** 2026-11-15 (Post Phase 8B: Reviews Moderation, Expenses Management & Reports Export)
**Current Phase:** Phase 8B Complete; Next: Phase 9A (CMS & Storefront Pages)

---

## 10-Phase Execution Roadmap

| Phase | Scope | Status | Verification & Artifacts |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **INSPECT (No Feature Code):** Real workspace audit, route status, permission comparison vs `seed.ts`, env & API client audit, `ADMIN_GAP_REPORT.md`, `BACKEND_GAPS.md`, `ADMIN_PERMISSION_MAP.md` | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (5 files / 17 passed), `build` (33/33 pages + Proxy) |
| **Phase 2** | **DESIGN SYSTEM + SHELL:** Mint/forest CSS tokens (`#DCEFE3`, `#15965F`, `#146B45`, `#F2FAF6`), light/dark themes, collapsible sidebar, top header, breadcrumbs, `PageHeader`, reusable components (`DataTable`, `FilterBar`, `DateRangePicker`, `KpiCard`, `ChartCard`, `StatusBadge`, `MoneyText`, `DateText`, `ConfirmDialog`, `PermissionGate`, etc.), `/dev/components` preview + RTL tests | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (12 files / 46 passed), `build` (34/34 pages + Proxy) |
| **Phase 3** | **AUTH:** `/login` UI, Redux in-memory token, single-flight refresh queue, session bootstrap (`/auth/refresh` -> `/auth/me`), `proxy.ts` + client guards, permission-filtered navigation, 401/403 pages, logout/logout-all, Socket.IO connect/disconnect lifecycle + tests | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (17 files / 66 passed), `build` (34/34 pages + Proxy) |
| **Phase 4** | **DASHBOARD & ALIGNMENT:** Greeting, Dhaka date, 11 Dhaka reporting periods (`today`, `yesterday`, `last_7_days`, `last_30_days`, `this_week`, `last_week`, `this_month`, `last_month`, `this_year`, `last_year`, `custom`) matching `period.util.ts`, compare toggle, 12 KPI cards, `inventory:view_cost` protection, Recharts analytics charts, top products/customers, recent orders, low-stock, abandoned summary, fraud alerts + tests | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (19 files / 88 passed), `build` (34/34 pages + Proxy), commits `36b93b6` |
| **Phase 5A** | **CATALOG (Categories & Products):** Categories tree (3-level depth, safe reassign delete, spec templates), Products list (paginated, debounced search, category/status/stock filters, BDT MoneyText, Dhaka dates), Product create/edit forms (multi-tab, live Decimal pricing calculator, dynamic specs, variants, SEO snippet preview, dirty guard, double-submit block, publish verification), Media slots (thumbnail, backview, gallery reorder, 5MB MIME validation) | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (21 files / 103 passed), `build` (34/34 pages + Proxy) |
| **Phase 5B** | **INVENTORY:** Inventory overview/movements/receive/adjust/damage/transfer, Suppliers, Purchase Orders, Stock Audits | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (22 files / 113 passed), `build` (35/35 pages + Proxy), commits `0751a5a` |
| **Phase 6A** | **ORDERS:** Orders list (search, filters, pagination, URL sync), Order detail modal (customer details, delivery destination, line items, API totals), State machine transitions (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `PACKED` -> `SHIPPED` -> `DELIVERED` -> `RETURNED` + `CANCELLED`), `ConfirmDialog` guards, authenticated binary PDF invoice blob download, admin/customer notes, lifecycle history timeline | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (24 files / 154 passed), `build` (35/35 pages + Proxy) |
| **Phase 6B** | **ABANDONED CHECKOUTS & CUSTOMERS:** Abandoned checkouts list/stats/recovery with consent & PII rules, Customers list/detail/notes/timeline/status | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (25 files / 165 passed), `build` (35/35 pages + Proxy) |
| **Phase 7A** | **PAYMENTS & FRAUD DETECTION:** Payments list/detail, masked transaction IDs, COD settlement mark-collected (`DELIVERED` order requirement), gateway event audit timeline, fraud stats, risk scoring review queue (LOW/MEDIUM/HIGH), approve/reject with required reason, customer OTP verification, fraud rules configuration/toggle with weight validation | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (27 files / 181 passed), `build` (35/35 pages + Proxy) |
| **Phase 7B** | **SHIPPING, RETURNS, REFUNDS:** Shipping zones/methods, shipments tracking, return requests workflow, gateway refunds execution (BG-27 logged) | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (32 files / 199 passed), `build` (35/35 pages + Proxy), commit `3ae7d49` |
| **Phase 8A** | **COUPONS & FLASH SALES:** Promotional discount vouchers CRUD (Percentage, Fixed BDT, Free Shipping, minimum purchase, max discount caps, per-user limits, usage limits, Dhaka schedule, dirty form guard, double-submit protection). Time-gated flash sale campaigns creation with dynamic variant allocation and BG-06 honest API handling. | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (34 files / 219 passed), `build` (35/35 pages + Proxy), commit `12f3ccc` |
| **Phase 8B** | **REVIEWS, REPORTS, EXPENSES:** Reviews moderation (approve/reject/delete with XSS protection), Expenses CRUD (exact decimal precision, Dhaka date range, category options), Reports views & authenticated blob downloads across 5 real backend domains (orders, sales, inventory, customers, financial). | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (37 files / 242 passed), `build` (36/36 pages + Proxy), commits `1c0fb15`, `49d7419`, `5b4529d` |
| **Phase 9** | **MANAGEMENT:** Notifications inbox + DEAD queue retry, CMS (settings groups, logo/favicon, banners, pages block editor, revisions/restore), Staff + Roles + Permissions, Audit Logs (`BACKEND_GAPS.md` honest state), Settings (read-only env status) | PENDING | — |
| **Phase 10** | **HARDENING:** Responsive pass (360–1920px), a11y audit (`axe`), Playwright E2E suite, bundle & token consistency check, final production build | PENDING | — |

---

## Phase 2 Delivery Summary (Completed 2026-11-11)
- **Tokens & Theming**:
  - HSL tokens mapped in `src/styles/theme.css` and `src/app/globals.css`: Mint (`#DCEFE3`), background (`#F2FAF6`), text (`#172D26`), primary (`#15965F`), deep forest (`#146B45`), pastels (`#F0E7FF`, `#E2F3FC`, `#FFF0E7`, `#E7F8EC`), semantic feedback tokens, dark mode palette, and Inter typography via `next/font/google`.
  - WCAG AA compliant contrast ratios verified (>7:1 on primary brand combinations).
- **Responsive Navigation Shell**:
  - Sidebar with collapsible desktop state, mobile drawer (`MobileNav`), permission-gated navigation items matching 74 permission slugs.
  - Topbar with theme switcher, global search placeholder, notifications bell indicator, and admin profile dropdown with secure logout.
  - Breadcrumbs with Dhaka path resolution and reusable `PageHeader`.
- **17 Reusable Components**:
  - `DataTable` with server-side pagination, sorting, URL synchronization.
  - `FilterBar` with debounced search and active filter reset.
  - `DateRangePicker` with Asia/Dhaka time presets.
  - `KpiCard` with pastels, trends, and strict `null percent => "—"` rule.
  - `ChartCard`, `StatusBadge` (with pulse indicator), `MoneyText` (BDT decimal string precision), `DateText` (Dhaka UTC+6), `ConfirmDialog`, `FormField` (RHF+Zod), `ImageSlotUploader` (thumbnail, backview, gallery), `RichTextEditor`, `EmptyState`, `ErrorState`, `Skeletons`, `PermissionGate` / `<Can>`, `Timeline`.
- **Testing & Preview Route**:
  - Dev preview page `/admin/dev/components` showcasing all components, tokens, and controls (guarded by `process.env.NODE_ENV === 'production'` -> `notFound()`).
  - Vitest + Testing Library test suite: 12 test files, 46 unit tests passing.
  - Next.js production build: 34/34 pages prerendered with 0 errors.

---

## Phase 3 Delivery Summary (Completed 2026-11-11)
- **Token Store & Single-Flight Client**:
  - In-memory JWT access token store (module-level volatile JS memory, never in localStorage/sessionStorage/IndexedDB).
  - HttpOnly `diano_refresh_token` cookie managed via same-origin Next.js BFF (`/api/auth/*`).
  - Axios 401 response interceptor with single-flight refresh queue: concurrent 401s coalesce into 1 refresh call and replay cleanly.
  - Multi-tab synchronization using `navigator.locks` with `BroadcastChannel` token broadcast and in-memory queue fallback.
  - Auth endpoints (`/auth/login`, `/auth/admin/login`, `/auth/refresh`, `/api/auth/*`) never retried to prevent infinite loops.
- **Session Bootstrap**:
  - `SessionBootstrapProvider` attempts silent refresh on app load -> calls `GET /auth/me` -> populates Redux auth slice (`status: loading | authenticated | unauthenticated`, `user`, `permissions[]`, `isSuperAdmin`).
  - Brand splash screen rendered during `loading` state to prevent flash of protected content.
  - `useAuthPermissions` / `usePermissions` / `<Can>` / `PermissionGate` wired directly to Redux and React Query `/auth/me` cache.
- **Login UI & Logout**:
  - Mint DIANO styled `/login` page with React Hook Form + Zod (`adminLoginSchema`).
  - Show/hide password visibility toggle, double-submit protection, and spinner.
  - Real backend error mapping: 401 generic message ("Invalid email or password" preserving email privacy), 403 lockout with retry countdown info, 403 inactive account, 403 non-admin portal restriction, 429 rate limit.
  - Strict `returnTo` sanitization (`sanitizeReturnUrl`): rejects external URLs, `//`, `/\`, backslashes, URI schemes (`javascript:`, `data:`, `https:`), and control characters.
  - Client logout clears in-memory token, resets Redux auth state, clears TanStack Query cache, disconnects WebSocket, and redirects to `/login`.
- **Route Protection & 403 Forbidden**:
  - `proxy.ts` performs optimistic cookie-presence check redirecting unauthenticated requests to `/login?returnTo=...` and authenticated requests to `/admin` (documented as UX convenience; real RBAC enforced on every backend request).
  - Client `AuthGate` wraps `src/app/(dashboard)/admin/layout.tsx`.
  - Checks route-level permissions against `ADMIN_PERMISSION_MAP.md` / `nav-config.ts`; displays `Forbidden403` component for unauthorized staff members without redirect loops.
- **Socket.IO Lifecycle**:
  - Singleton `Socket.IO` client authenticates with JWT handshake (`auth: { token }`) strictly after user is authenticated.
  - Reconnects with updated token on token refresh; disconnects cleanly on logout/session loss.
  - Real-time notification indicator in topbar bell connected to `notification:new` events.
  - Documented gap BG-17 in `BACKEND_GAPS.md` for missing dedicated unread count endpoint/event.

---

## Phase 4 Delivery Summary & Dashboard Alignment (Completed 2026-11-12 & 2026-11-15)
- **Asia/Dhaka Period & Compare Foundation**:
  - `src/lib/utils/dhaka-period.ts`: Pure offset-based calculations for UTC+6 (`Asia/Dhaka`), resolving start/end boundaries for all 11 reporting periods matching backend `period.util.ts`: `today`, `yesterday`, `last_7_days`, `last_30_days`, `this_week`, `last_week`, `this_month`, `last_month`, `this_year`, `last_year`, `custom` (Bangladesh week starts Saturday).
  - Financial percent delta calculation: returns `null` ("—", never `NaN` or `Infinity`) when previous value is zero, null, or undefined.
  - `useDashboardPeriod` hook syncs period and compare toggle directly with URL search params (`?period=...&compare=true/false`).
  - Interactive `DashboardPeriodSelector` with keyboard-accessible dropdown, custom date inputs, and compare toggle.
- **12 Required Executive KPI Cards**:
  - Total Orders, Undelivered Orders, Delivered Sales, Gross Sales, Discounts, Net Sales, Total Products, Total Stock Units, Stock Value, Damaged Qty, Damage Value, Net Stock Value.
  - Financial cost figures (`stockValue`, `damageValue`, `netStockValue`) guarded by `inventory:view_cost`; shows "Restricted Access" badge instead of ৳0.00 when permission is missing.
- **Data Layer & Query Hooks**:
  - `fetchAnalyticsOverview` (`/admin/analytics/overview`): returns comparative cards.
  - `fetchAnalyticsRevenue` (`/admin/analytics/revenue`): returns Gross Sales, Discounts, Net Sales, Shipping Collected.
  - `fetchInventorySummary` (`/inventory/summary`): returns snapshot stock units and valuations.
  - `fetchAnalyticsChart` (`/admin/analytics/charts/:type`): fetches time-series and distribution charts (`sales-trend`, `order-status-pie`, `shipment-status`, `stock-by-subcategory`).
  - `fetchAnalyticsProducts` (`/admin/analytics/products`): fetches top-performing products.
  - `fetchLowStockItems` (`/inventory/low-stock`) & `fetchRecentOrders` (`/admin/orders`).
  - TanStack Query hooks with 60s staleTime, `placeholderData: (prev) => prev` to prevent UI flicker on period change, and parallel independent fetching.
- **UI Components & Charts**:
  - `KpiGrid`: 12 KPI cards styled with DIANO pastel variants, BDT formatting via `MoneyText`, and compare deltas.
  - `SalesTrendChart`, `OrderStatusChart`, `ShipmentStatusChart`, `StockSubcategoryChart`.
  - `RecentOrdersCard`, `LowStockCard`, `TopProductsCard`.
- **Real-Time Synchronization**:
  - `useDashboardRealtime` hook connects to backend Socket.IO events (`order:new`, `order:status`, `payment:status`, `stock:low`) with 1500ms debounce.
- **Verification & Tests**:
  - `tests/unit/analytics/dhaka-period.test.ts`: 12 tests verifying all 11 periods and Saturday week alignment.
  - `tests/unit/analytics/dashboard-widgets.test.tsx`: 10 tests verifying 12 KPI cards, permission guards, error states.

---

## Phase 5A Delivery Summary (Completed 2026-11-12)
- **Categories Architecture & Management** (`/admin/categories`):
  - 3-level hierarchical tree view (`Root (Depth 1)`, `Subcategory (Depth 2)`, `Child (Depth 3)`) with collapsible nodes, active status toggling, and reordering.
  - Category create and edit modal with depth limits strictly preventing >3 level nesting.
  - Soft-delete dialog enforcing backend safety rules: requires target `reassignToId` when category has active products or subcategories.
  - Specification template attribute editor (`text`, `select`, `number`) with drag/sort order and required toggles.
- **Products Catalog List** (`/admin/products`):
  - Server-side paginated `DataTable` with thumbnail previews, product names, SKU badges, hierarchical categories, `MoneyText` (৳ BDT) prices, and `DateText` (Asia/Dhaka).
  - `ProductsFilterBar` with debounced search (`q`), category selector, status filter, stock availability, and multi-field sorting synced with URL search parameters via `useTableQueryParams`.
  - Permission-gated actions: edit (`product:update`), status transition (`product:publish`), featured toggle (`product:update`), delete with confirmation (`product:delete`).
- **Product Create & Edit Master Form** (`/admin/products/new`, `/admin/products/:id`):
  - Multi-tab sections: Basic Info, Pricing & Discounts, Variants, Dynamic Specifications, Media Slots, SEO & Search.
  - Real-time client-side pricing calculator (`calculateClientPricing`) implementing pure Decimal precision arithmetic (half-up rounding, IEEE-754 safety) for percentage discounts, fixed discounts, and cost price warnings.
  - Dynamic variant row manager with SKU regex validation, compareAtPrice &ge; price rule, and confidential `costPrice` gating (`product:view_cost`).
  - Dynamic category-driven specification fields loaded from `GET /categories/:id/product-form-schema`.
  - Google SERP search result snippet preview with slug and meta descriptions.
  - Dirty form guard (`useDirtyFormGuard`), double-submission blocking, and backend validation error mapping (`mapBackendValidationErrors`).
  - Publish guard preventing transition to `ACTIVE` without category, variants, valid SKU, or thumbnail.
- **Media Slots** (Cloudinary Integration):
  - Multi-slot uploader supporting Thumbnail (Front view), Back View, and Gallery slots.
  - Client-side validation enforcing 5MB max file size and WebP, JPEG, PNG MIME types with user-friendly alerts.
  - Gallery image reordering (`PUT /products/:id/images/reorder`) and single image deletion (`DELETE /products/:id/images/:imageId`).
- **Verification & Tests**:
  - `tests/unit/catalog/categories.test.tsx`: 5 tests verifying tree depth, permission protection, reassign deletion, and spec templates.
  - `tests/unit/catalog/products.test.tsx`: 10 tests verifying pure Decimal pricing math, table rendering and permission gates, publish requirement guards, and 5MB / MIME media validations.
  - Total test suite: 21 test files, 103 tests passing (0 failed, 0 skipped).
  - TypeScript: 0 errors (`tsc --noEmit`); ESLint: 0 warnings, 0 errors.

---

## Phase 5B Delivery Summary (Completed 2026-11-12)
- **Stock Overview & Management** (`/admin/inventory`):
  - Summary KPI cards (`totalProducts`, `totalStockUnits`, `available`, `reserved`, `damaged`, plus `stockValue`, `damageValue`, `netStockValue` viewable only with `inventory:view_cost`).
  - Stock table displaying on-hand, reserved, damaged, available, and dynamic stock status badges (`in stock`, `low stock`, `out of stock`).
  - `StockFilterBar` with URL param synchronization (`search`, `warehouseId`, `categoryId`, `lowStockOnly`, `outOfStockOnly`) via `useTableQueryParams`.
  - Manual stock adjustment & damage quarantine modal (`POST /inventory/adjust`, `POST /inventory/damage`), strictly enforcing non-zero integer quantities, minimum 3-character reason for audit compliance, and handling backend insufficient-stock error responses gracefully.
- **Immutable Stock Ledger** (Audit Trail Guarantee):
  - Append-only ledger displaying timestamped movements (`StockMovementsTable`).
  - Renders movement type (`PURCHASE_RECEIPT`, `ORDER_RESERVATION`, `ORDER_RELEASE`, `ORDER_FULFILLMENT`, `ORDER_CANCELLATION`, `RETURN_RESTOCK`, `DAMAGE_ADJUSTMENT`, `AUDIT_ADJUSTMENT`, `MANUAL_ADJUSTMENT`, `TRANSFER_IN`, `TRANSFER_OUT`), quantity before/after, delta, reason, reference type, and reference ID.
  - Strictly immutable: zero edit, delete, or modify actions exist in code or DOM.
- **Suppliers Management** (`/admin/suppliers`):
  - Paginated list of vendor suppliers with code, contact person, email, phone, and active status toggle.
  - Supplier create and edit modal (`POST /suppliers`, `PATCH /suppliers/:id`) with form validation, double-submit protection, and error mapping (`mapBackendValidationErrors`).
  - Deactivate / delete confirmation dialog (`DELETE /suppliers/:id`).
  - Permission-gated actions (`supplier:manage`).
- **Purchase Orders & Inbound Receiving** (`/admin/purchases`):
  - Multi-warehouse purchase order management (`GET /purchase-orders`, `POST /purchase-orders`).
  - Create PO modal with dynamic line items (variant selector, orderedQuantity, unitCost, live line totals, and grand total).
  - Purchase order detail modal with complete lifecycle `Timeline` and status tracking: `DRAFT`, `ORDERED`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED`.
  - State machine transitions strictly enforced.
  - Inbound receiving (`POST /purchase-orders/:id/receive`) with row-locking atomicity (BG-22).
- **Physical Stock Audits & Reconciliation**:
  - Start stock audit modal (`POST /inventory/audits`) with warehouse selection and notes.
  - Stock audit count sheet with shortage/surplus highlights.
  - Audit approval (`POST /inventory/audits/:id/approve`) with row-locking atomicity (BG-23).
- **Verification & Tests**:
  - `tests/unit/inventory/inventory.test.tsx`: 10 comprehensive tests.
  - Vitest: 22 test files, 113 unit tests passing (0 failed, 0 skipped).

---

## Phase 6B Delivery Summary (Completed 2026-11-13)
- **Part 0: Shared Fixes, Rules Merge & 6A Verification**:
  - Merged backend rules from `../diano-server/docs/AGENT_RULES.md` into `diano-admin/docs/AGENT_RULES.md`.
  - Created `scripts/check-bom.mjs` verifying zero BOM markers.
  - Decimal precision in `inventory-summary-cards.tsx`: `stockValue`, `damageValue`, and `netStockValue` guarded by `inventory:view_cost`.
  - Order Detail Modal modularization: split into focused subcomponents.
- **Abandoned Checkouts (`/admin/abandoned-checkouts`)**:
  - Server-side paginated `DataTable` showing session ID, customer contact info, item count, total cart value (`MoneyText`), device icon, status badge, and last activity date.
  - `AbandonedFilterBar` with status and date range filter inputs.
  - `AbandonedDetailModal` with recovery outreach action (`POST /abandoned-checkouts/:id/recovery`).
- **Customers Management (`/admin/customers`)**:
  - Server-side paginated `DataTable` showing customer name, contact details, orders count, total spent (`MoneyText`), loyalty points, status badge.
  - `CustomerDetailModal` showing profile, lifetime order summary, saved addresses, consents, staff notes, and account status toggle action.
- **Verification & Tests**:
  - `tests/unit/abandoned/abandoned.test.tsx`: 5 tests.
  - `tests/unit/customers/customers.test.tsx`: 6 tests.
  - `tests/unit/orders/orders.test.tsx`: 25 tests.
  - Full test suite: 25 test files, 165 unit tests passing.

---

## Phase 7A Delivery Summary (Completed 2026-11-14)
- **Payments Management (`/admin/payments`)**:
  - Paginated `DataTable` with order links, provider badge (`SSLCOMMERZ` vs `Cash on Delivery`), BDT `MoneyText` formatting, `StatusBadge`, and masked transaction IDs (`maskTransactionId`).
  - Cash on Delivery (COD) settlement: "Mark COD Collected" action requiring `order.status === 'DELIVERED'`.
- **Fraud Detection & Review Queue (`/admin/fraud-detection`)**:
  - Real-time `FraudStatsCards` displaying high-risk flagged counts, pending review counts, medium-risk counts, false positive rates.
  - Review queue `DataTable` with risk tier badges (`LOW`, `MEDIUM`, `HIGH`).
  - Staff review actions: "Approve Order (Clear Hold)", "Reject & Cancel Order", Customer OTP dispatch & verification.
  - `FraudRulesTable` with active switches and weight calibration.
- **Verification & Tests**:
  - `tests/unit/payments/payments.test.tsx`: 8 tests.
  - `tests/unit/fraud/fraud.test.tsx`: 8 tests.
  - Full test suite: 27 test files, 181 unit tests passing.

---

## Phase 7B Delivery Summary (Completed 2026-11-14)
- **Shipping Settings & Logistics (`/admin/shipping`)**:
  - Delivery Zones management covering all 64 Bangladesh districts.
  - Shipping Methods management: base delivery charge, per-kg extra weight rate, free shipping threshold (zero-float Decimal string validations), estimated delivery days, sort orders.
  - Shipment Management & Courier Tracking: Courier partner presets (Steadfast, Pathao, RedX, Paperfly, Sundarban, eCourier), tracking number, status update across all 9 real `ShipmentStatus` enum states.
- **Returns & RMA (`/admin/returns`)**:
  - Returns list with URL param filtering.
  - Detail modal and operational decisions (Approve, Reject with mandatory reason).
  - Physical inspection modal recording condition (`GOOD` / `DAMAGED`) and processing action (`REFUND` / `REPLACE` / `REJECT`) per item.
  - Query invalidation triggers `['orders']` and `['inventory']` on return review/receive.
- **Refunds & Settlements (`/admin/refunds`)**:
  - Refunds list and detail modal with gateway references and settlement timestamps.
  - Issue order refund modal with positive Decimal string validation and mandatory reason.
  - Documented BG-27 in `docs/BACKEND_GAPS.md` and added honest UI notices explaining internal ledger settlement vs simulated gateway references.
- **Verification & Tests**:
  - `tests/unit/shipping/shipping.test.tsx`: 6 tests.
  - `tests/unit/returns/returns.test.tsx`: 5 tests.
  - `tests/unit/refunds/refunds.test.tsx`: 3 tests.
  - Full test suite: 32 test files, 199 unit tests passing.

---

## Phase 8A Delivery Summary (Completed 2026-11-15)
- **Coupons Management (`/admin/coupons`)**:
  - Full CRUD operations with server-side pagination and URL search params (`search`, `type`, `isActive`).
  - Supports `PERCENTAGE`, `FIXED` (৳ BDT), and `FREE_SHIPPING` types with min spend thresholds and max discount caps.
  - Usage limits, per-user limits, first order only, allow on sale toggles, and Asia/Dhaka schedule handling.
  - Form validation with `useDirtyFormGuard`, double-submission blocking, and backend error mapping.
  - Delete action with `ConfirmDialog` and error alert on failure.
- **Flash Sales Campaigns (`/admin/flash-sales`)**:
  - Active campaigns table with campaign title, description, time-window countdown, and allocated variant badges.
  - Launch flash sale modal with dynamic variant rows (variantId, discountPrice, stockLimit).
  - Strict compliance with BG-06 contract: displays read-only status and informational banner explaining backend lacks update/delete endpoints.
- **Verification & Tests**:
  - `tests/unit/coupons/coupons.test.tsx`: 6 unit tests covering table rendering, delete dialog, URL param sync, form validation, edit prefill, and permission gates.
  - `tests/unit/flash-sales/flash-sales.test.tsx`: 4 unit tests covering table rendering, campaign validation, dynamic variant rows, and permission gates.
  - Full test suite: 34 test files, 219 unit tests passing (0 failed, 0 skipped).
  - TypeScript: 0 errors; ESLint: 0 warnings, 0 errors; clean production build.

---

## Phase 8B Delivery Summary (Completed 2026-11-15)
- **Reviews Moderation (`/admin/reviews`)**:
  - Server-side paginated list with real filters (`status`: `PENDING`, `APPROVED`, `REJECTED`, `rating`: 1..5, and search) synchronized with URL search params.
  - Review detail & moderation dialog with customer info, verified purchase badge, star rating, product details, and attached images.
  - Strict HTML escaping / XSS protection (raw strings rendered safely without `dangerouslySetInnerHTML`).
  - Operational actions: Approve review (recalculates product average rating), Reject review (with optional/mandatory reason), Delete review with `ConfirmDialog` and double-submit prevention.
  - Permission-gated actions (`review:moderate`); read-only users (`review:read`) cannot see mutating buttons.
- **Expenses Management (`/admin/expenses`)**:
  - Full CRUD operations with server-side pagination and category + Asia/Dhaka date range filters.
  - Categories mapped strictly to backend enum (`RENT`, `SALARIES`, `UTILITIES`, `MARKETING`, `PACKAGING`, `LOGISTICS`, `OFFICE_SUPPLIES`, `SOFTWARE_SUBSCRIPTION`, `MAINTENANCE`, `OTHER`).
  - Create and edit modal with pure Decimal validation (positive decimal strings, zero float IEEE-754 precision loss), note length limits (500 chars), and Asia/Dhaka timestamp conversion.
  - Form state guarded by `useDirtyFormGuard` and double-submit prevention.
  - Deletion guarded by `ConfirmDialog` and permission-gated with `expense:manage`.
- **Reports Views & Data Export (`/admin/reports`)**:
  - Tabbed interface supporting all 5 real backend report export domains (`orders`, `sales`, `inventory`, `customers`, `financial`).
  - Authenticated binary blob stream downloads (`POST /api/v1/admin/reports/:domain`) via Axios with automatic browser file download dispatch and clean object URL revocation.
  - Robust JSON error extraction from binary blobs: parses structured backend validation errors (e.g. 400 Bad Request, 413 Payload Too Large) and surfaces real error banners without corrupt file downloads.
  - Displays live API snapshot metrics for each domain loaded from real analytics endpoints (`/admin/analytics/*` and `/inventory/summary`).
  - Strict financial protection: Financial statement tab and export strictly guarded behind `analytics:view_finance` (shows "Restricted Financial Access" card when unauthorized; never recomputes or masks financial figures client-side).
  - BG-07 compliance: Informational notice detailing that standalone exports for products, payments, and expenses are integrated directly into the 5 core export streams.
- **Verification & Tests**:
  - `tests/unit/reviews/reviews.test.tsx`: 7 unit tests covering table rendering, delete confirmation, URL param sync, approve/reject flow, XSS HTML escaping safety, and permission gates.
  - `tests/unit/expenses/expenses.test.tsx`: 8 unit tests covering table rendering, delete confirmation, category/date URL filtering, exact decimal validation, backend error mapping, dirty form guard, and permission gates.
  - `tests/unit/reports/reports.test.tsx`: 8 unit tests covering tab switching, live API snapshot display, pure MoneyText figures, blob export dispatch, error-in-blob extraction, and `analytics:view_finance` access restrictions.
  - Full test suite: 37 test files, 242 unit tests passing (0 failed, 0 skipped).
  - TypeScript: 0 errors; ESLint: 0 warnings, 0 errors; clean production build.

