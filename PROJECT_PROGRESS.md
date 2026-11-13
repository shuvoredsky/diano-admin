# DIANO Admin Dashboard — Project Progress (`PROJECT_PROGRESS.md`)

**Last Updated:** 2026-11-13
**Current Phase:** Phase 6B Complete (Abandoned Checkouts List & Recovery Outreach, Customers Directory & Lifecycle Management, Shared Fixes & Verification)

---

## 10-Phase Execution Roadmap

| Phase | Scope | Status | Verification & Artifacts |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **INSPECT (No Feature Code):** Real workspace audit, route status, permission comparison vs `seed.ts`, env & API client audit, `ADMIN_GAP_REPORT.md`, `BACKEND_GAPS.md`, `ADMIN_PERMISSION_MAP.md` | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (5 files / 17 passed), `build` (33/33 pages + Proxy) |
| **Phase 2** | **DESIGN SYSTEM + SHELL:** Mint/forest CSS tokens (`#DCEFE3`, `#15965F`, `#146B45`, `#F2FAF6`), light/dark themes, collapsible sidebar, top header, breadcrumbs, `PageHeader`, reusable components (`DataTable`, `FilterBar`, `DateRangePicker`, `KpiCard`, `ChartCard`, `StatusBadge`, `MoneyText`, `DateText`, `ConfirmDialog`, `PermissionGate`, etc.), `/dev/components` preview + RTL tests | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (12 files / 46 passed), `build` (34/34 pages + Proxy) |
| **Phase 3** | **AUTH:** `/login` UI, Redux in-memory token, single-flight refresh queue, session bootstrap (`/auth/refresh` -> `/auth/me`), `proxy.ts` + client guards, permission-filtered navigation, 401/403 pages, logout/logout-all, Socket.IO connect/disconnect lifecycle + tests | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (17 files / 66 passed), `build` (34/34 pages + Proxy) |
| **Phase 4** | **DASHBOARD:** Greeting, Dhaka date, period selector (`today`..`custom`), compare toggle, 12 KPI cards, Recharts analytics charts, top products/customers, recent orders, low-stock, abandoned summary, fraud alerts + tests | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (19 files / 88 passed), `build` (34/34 pages + Proxy) |
| **Phase 5A** | **CATALOG (Categories & Products):** Categories tree (3-level depth, safe reassign delete, spec templates), Products list (paginated, debounced search, category/status/stock filters, BDT MoneyText, Dhaka dates), Product create/edit forms (multi-tab, live Decimal pricing calculator, dynamic specs, variants, SEO snippet preview, dirty guard, double-submit block, publish verification), Media slots (thumbnail, backview, gallery reorder, 5MB MIME validation) | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (21 files / 103 passed), `build` (34/34 pages + Proxy) |
| **Phase 5B** | **INVENTORY:** Inventory overview/movements/receive/adjust/damage/transfer, Suppliers, Purchase Orders, Stock Audits | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (22 files / 113 passed), `build` (35/35 pages + Proxy) |
| **Phase 6A** | **ORDERS:** Orders list (search, filters, pagination, URL sync), Order detail modal (customer details, delivery destination, line items, API totals), State machine transitions (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `PACKED` -> `SHIPPED` -> `DELIVERED` -> `RETURNED` + `CANCELLED`), `ConfirmDialog` guards, authenticated binary PDF invoice blob download, admin/customer notes, lifecycle history timeline | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (24 files / 154 passed), `build` (35/35 pages + Proxy) |
| **Phase 6B** | **ABANDONED CHECKOUTS & CUSTOMERS:** Abandoned checkouts list/stats/recovery with consent & PII rules, Customers list/detail/notes/timeline/status | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (25 files / 165 passed), `build` (35/35 pages + Proxy) |
| **Phase 7** | **PAYMENTS, FRAUD, SHIPPING, RETURNS/REFUNDS:** Payments list/detail/refund/COD mark-collected (bKash/Nagad "Coming soon"), Fraud rules/review queue/approve/reject/OTP, Shipping zones/methods/shipments, Returns & Refunds | PENDING | — |
| **Phase 8** | **MARKETING, REVIEWS, REPORTS:** Coupons CRUD, Flash Sales, Reviews (`BACKEND_GAPS.md` honest state), Reports (`orders`, `sales`, `inventory`, `customers`, `financial` CSV/XLSX/PDF blob downloads + 413 handling), Expenses CRUD | PENDING | — |
| **Phase 9** | **MANAGEMENT:** Notifications inbox + DEAD queue retry, CMS (settings groups, logo/favicon, banners, pages block editor, revisions/restore), Staff + Roles + Permissions, Audit Logs (`BACKEND_GAPS.md` honest state), Settings (read-only env status) | PENDING | — |
| **Phase 10** | **HARDENING:** Responsive pass (360–1920px), a11y audit (`axe`), Playwright E2E suite, bundle & token consistency check, final production build | PENDING | — |
| **Phase 7** | **PAYMENTS, FRAUD, SHIPPING, RETURNS/REFUNDS:** Payments list/detail/refund/COD mark-collected (bKash/Nagad "Coming soon"), Fraud rules/review queue/approve/reject/OTP, Shipping zones/methods/shipments, Returns & Refunds | PENDING | — |
| **Phase 8** | **MARKETING, REVIEWS, REPORTS:** Coupons CRUD, Flash Sales, Reviews (`BACKEND_GAPS.md` honest state), Reports (`orders`, `sales`, `inventory`, `customers`, `financial` CSV/XLSX/PDF blob downloads + 413 handling), Expenses CRUD | PENDING | — |
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

## Phase 4 Delivery Summary (Completed 2026-11-12)
- **Asia/Dhaka Period & Compare Foundation**:
  - `src/lib/utils/dhaka-period.ts`: Pure offset-based calculations for UTC+6 (`Asia/Dhaka`), resolving start/end boundaries for `today`, `yesterday`, `last_7_days`, `last_30_days`, `this_month`, `last_month`, `custom`.
  - Financial percent delta calculation: returns `null` ("—", never `NaN` or `Infinity`) when previous value is zero, null, or undefined.
  - `useDashboardPeriod` hook syncs period and compare toggle directly with URL search params (`?period=...&compare=true/false`).
  - Interactive `DashboardPeriodSelector` with keyboard-accessible dropdown, custom date inputs, and compare toggle.
- **Data Layer & Query Hooks**:
  - `fetchAnalyticsOverview` (`/admin/analytics/overview`): returns comparative cards (12 KPIs + deliveredSales).
  - `fetchAnalyticsChart` (`/admin/analytics/charts/:type`): fetches time-series and distribution charts (`sales-trend`, `order-status-pie`, `shipment-status`, `stock-by-subcategory`).
  - `fetchAnalyticsProducts` (`/admin/analytics/products`): fetches top-performing products.
  - `fetchLowStockItems` (`/inventory/low-stock`) & `fetchRecentOrders` (`/admin/orders`).
  - TanStack Query hooks with 60s staleTime, `placeholderData: (prev) => prev` to prevent UI flicker on period change, and parallel independent fetching.
  - Isolated widget error handling: each widget handles its own loading, error, and empty state with individual Retry actions.
  - Sensitive financial metrics (`grossProfit`, `netProfit`) gated behind `analytics:view_finance`; displays "Restricted Access" badge instead of ৳0.00 when permission is missing.
- **UI Components & Layout**:
  - `KpiGrid`: 12 KPI cards styled with DIANO pastel variants (`lavender`, `sky`, `peach`, `softgreen`), BDT formatting via `MoneyText`, and compare deltas.
  - `SalesTrendChart`: Recharts AreaChart for Gross vs Net Sales with Dhaka bucket formatting and BDT tooltips.
  - `OrderStatusChart`: Recharts Donut/Pie chart for order lifecycle breakdown with status color tokens.
  - `ShipmentStatusChart`: Recharts horizontal BarChart for courier and delivery performance.
  - `StockSubcategoryChart`: Recharts stacked BarChart for available vs damaged inventory units by category.
  - `RecentOrdersCard`: Recent order transactions with status badges and relative Dhaka timestamps.
  - `LowStockCard`: Variant-level reorder point alerts.
  - `TopProductsCard`: Top selling products ranked by revenue and quantity.
  - Main `/admin` route mounted with `DashboardView`.
- **Real-Time Synchronization**:
  - `useDashboardRealtime` hook connects to backend Socket.IO events (`order:new`, `order:status`, `payment:status`, `stock:low`) with 1500ms debounce to invalidate analytics, order, and inventory queries.
  - Manual "Refresh" button and "Updated: [time]" indicator.
- **Verification & Tests**:
  - `tests/unit/analytics/dhaka-period.test.ts`: 9 tests verifying Dhaka date parts, month boundaries, and zero-safe percent changes.
  - `tests/unit/analytics/dashboard-widgets.test.tsx`: 9 tests verifying all 12 KPI cards, finance permission protection, URL param sync, isolated error retry, and list cards.
  - Total test suite: 19 test files, 88 tests passing (0 failed, 0 skipped).
  - TypeScript: 0 errors (`tsc --noEmit`).
  - ESLint: 0 warnings, 0 errors.

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
  - TypeScript: 0 errors (`tsc --noEmit`).
  - ESLint: 0 warnings, 0 errors.

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
  - State machine transitions strictly enforced:
    - `DRAFT` -> `ORDERED` or `CANCELLED`.
    - `ORDERED` -> `PARTIALLY_RECEIVED` (via receive) or `CANCELLED`.
    - Terminal states `RECEIVED` and `CANCELLED` permit no further transitions.
  - Partial & full inbound receiving (`POST /purchase-orders/:id/receive`):
    - Input clamping to remaining ordered quantities.
    - Prevents double-submit with loading guards.
    - Atomically updates stock on-hand, recalculates weighted average cost price, and logs `PURCHASE_RECEIPT` ledger entries on backend.
- **Physical Stock Audits & Reconciliation**:
  - Start stock audit modal (`POST /inventory/audits`) with warehouse selection and notes.
  - Stock audit list with discrepancy counts, status (`IN_PROGRESS`, `APPROVED`, `REJECTED`), and timestamps.
  - Audit detail & count sheet modal (`GET /inventory/audits/:id`, `POST /inventory/audits/:id/counts`):
    - Displays recorded variants, system on-hand, counted physical stock, and calculated variance.
    - Color-coded highlights for Shortage (negative), Surplus (positive), and Balanced (zero).
    - Approve audit action (`POST /inventory/audits/:id/approve`): reconciles discrepancies strictly through `AUDIT_ADJUSTMENT` ledger movements; never mutates stock directly.
    - Reject audit action (`POST /inventory/audits/:id/reject`) with optional reason.
- **Verification & Tests**:
  - `tests/unit/inventory/inventory.test.tsx`: 10 comprehensive tests covering stock breakdown, immutable ledger guarantee, supplier validation, PO lifecycle state transitions, inbound receiving clamping and validation, physical audit variance calculations, and insufficient stock backend error handling.
  - Vitest: 22 test files, 113 unit tests passing (0 failed, 0 skipped).
  - TypeScript: 0 errors (`tsc --noEmit`).
  - ESLint: 0 warnings, 0 errors.

---

## Phase 6B Delivery Summary (Completed 2026-11-13)
- **Part 0: Shared Fixes, Rules Merge & 6A Verification**:
  - Merged backend rules from `../diano-server/docs/AGENT_RULES.md` into `diano-admin/docs/AGENT_RULES.md` while retaining automated push policy.
  - Created `scripts/check-bom.mjs` verifying zero BOM markers across the workspace.
  - Verified `.env` audit: strictly `.env.example` in repo and git history.
  - Decimal precision in `inventory-summary-cards.tsx`: `stockValue`, `damageValue`, and `netStockValue` formatted via `MoneyText` (pure decimal strings, no `Number()` coercion), guarded by `inventory:view_cost`.
  - Renamed `vitest.config.ts` to `vitest.config.mts` and switched `__dirname` to `import.meta.dirname`, removing native configLoader warnings.
  - Race conditions & concurrency gaps documented in `docs/BACKEND_GAPS.md` (BG-22 PO Receive concurrency, BG-23 Stock Audit sequential adjustments, BG-24 Order REFUNDED status transition is label-only).
  - Regression tests for `ConfirmDialog` (`tests/unit/components/confirm-dialog.test.tsx`): 4 tests covering success, rejection keeping dialog open, and rich ReactNode description without Radix hydration errors.
  - Order Detail Modal modularization: reduced `order-detail-modal.tsx` from 698 lines to 170 lines by splitting into `order-detail-cards.tsx`, `order-items-table.tsx` (with `order:view_cost` confidential masking), `order-notes-section.tsx`, `order-timeline-section.tsx`, and `order-status-actions.tsx`.
- **Abandoned Checkouts (`/admin/abandoned-checkouts`)**:
  - Server-side paginated `DataTable` showing session ID, customer contact info, item count, total cart value (`MoneyText`), device icon (`MOBILE`, `DESKTOP`, `TABLET`), status badge, and last activity date.
  - `AbandonedFilterBar` with status and date range filter inputs synchronized with URL query params via `useTableQueryParams`.
  - `AbandonedDetailModal` inspecting customer snapshot, cart line items, total value, recovery outreach action (`POST /abandoned-checkouts/:id/recovery`), previous recovery history, and session events log.
  - Gated recovery trigger behind `abandoned_checkout:manage`.
- **Customers Management (`/admin/customers`)**:
  - Server-side paginated `DataTable` showing customer name, contact details (email/phone), orders count, total spent (`MoneyText`), loyalty points, status badge, and registration date.
  - `CustomersFilterBar` with search input (name, email, phone) and status filter select.
  - `CustomerDetailModal` showing personal profile, lifetime order summary (spent, orders, cancelled, returned), saved delivery addresses with type badges, communication preferences / consents, staff internal notes with submission form, and account status toggle action (Suspend / Activate) guarded by `ConfirmDialog` and `customer:manage`.
- **Verification & Tests**:
  - `tests/unit/abandoned/abandoned.test.tsx`: 5 tests covering table rendering, detail modal sections, recovery outreach dispatch, and permission gating.
  - `tests/unit/customers/customers.test.tsx`: 6 tests covering table rendering, detail modal sections, staff notes submission, status suspension action, and permission gating.
  - `tests/unit/orders/orders.test.tsx`: 25 tests covering FSM transitions (RETURNED terminal), 403 fraud review hold error handling, confidential `order:view_cost` masking, and JSON error extraction from invoice blobs.
  - Full test suite: 25 test files, 165 unit tests passing (0 failed, 0 skipped).
  - Full production build: 35/35 routes prerendered with Turbopack exit code 0.







