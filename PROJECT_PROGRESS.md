# DIANO Admin Dashboard — Project Progress (`PROJECT_PROGRESS.md`)

**Last Updated:** 2026-11-11
**Current Phase:** Phase 3 Complete (Authentication, In-Memory Token Store, Refresh Queue, Session Bootstrap, Route & Permission Guards, Socket.IO Lifecycle)

---

## 10-Phase Execution Roadmap

| Phase | Scope | Status | Verification & Artifacts |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **INSPECT (No Feature Code):** Real workspace audit, route status, permission comparison vs `seed.ts`, env & API client audit, `ADMIN_GAP_REPORT.md`, `BACKEND_GAPS.md`, `ADMIN_PERMISSION_MAP.md` | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (5 files / 17 passed), `build` (33/33 pages + Proxy) |
| **Phase 2** | **DESIGN SYSTEM + SHELL:** Mint/forest CSS tokens (`#DCEFE3`, `#15965F`, `#146B45`, `#F2FAF6`), light/dark themes, collapsible sidebar, top header, breadcrumbs, `PageHeader`, reusable components (`DataTable`, `FilterBar`, `DateRangePicker`, `KpiCard`, `ChartCard`, `StatusBadge`, `MoneyText`, `DateText`, `ConfirmDialog`, `PermissionGate`, etc.), `/dev/components` preview + RTL tests | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (12 files / 46 passed), `build` (34/34 pages + Proxy) |
| **Phase 3** | **AUTH:** `/login` UI, Redux in-memory token, single-flight refresh queue, session bootstrap (`/auth/refresh` -> `/auth/me`), `proxy.ts` + client guards, permission-filtered navigation, 401/403 pages, logout/logout-all, Socket.IO connect/disconnect lifecycle + tests | **DONE** | `typecheck` (0 errors), `lint` (0 warnings/errors), `test` (17 files / 66 passed), `build` (34/34 pages + Proxy) |
| **Phase 4** | **DASHBOARD:** Greeting, Dhaka date, period selector (`today`..`custom`), compare toggle, 12 KPI cards, Recharts analytics charts, top products/customers, recent orders, low-stock, abandoned summary, fraud alerts + tests | PENDING | — |
| **Phase 5** | **CATALOG + INVENTORY:** Products list/create/edit/details (`form-options`, dynamic spec schema, MRP/discount pricing, variants, Cloudinary slots, publish gate), Categories tree & spec template editor, Inventory overview/movements/receive/adjust/damage/transfer, Suppliers, Purchase Orders, Stock Audits | PENDING | — |
| **Phase 6** | **ORDERS, ABANDONED, CUSTOMERS:** Orders list/detail/state-machine transitions/timeline/notes/invoice PDF, Abandoned checkouts list/stats/recovery with consent & PII rules, Customers list/detail/notes/timeline/status | PENDING | — |
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


