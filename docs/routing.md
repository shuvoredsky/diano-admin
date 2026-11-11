# Routing & Next.js 16 Proxy Architecture

## 1. Official Next.js 16 Proxy Convention (`src/proxy.ts`)

In Next.js 16, the legacy `middleware.ts` convention is replaced by `proxy.ts` exporting `proxy(request: NextRequest)`.

Our implementation in `src/proxy.ts` delegates decision logic to pure, unit-tested helpers in `src/lib/auth/proxy-guard.ts`:

1. **Unauthenticated `/admin/*` requests:** If the `diano_refresh_token` cookie is absent, the request is redirected (`307`) to `/login?returnUrl=<encoded-path>`.
2. **Authenticated `/login` requests:** If `diano_refresh_token` is present, the user is redirected (`307`) to the sanitized `returnUrl` (defaulting to `/admin`).
3. **Open-Redirect Protection:** `sanitizeReturnUrl()` rejects external URLs (`https://...`), protocol-relative URLs (`//...`), backslash tricks (`/\...`), and recursive `/login` targets.
4. **Performance & Security Boundary:** `src/proxy.ts` performs zero database or network calls. Cookie presence is treated strictly as an optimistic routing hint, never as authorization proof.

## 2. App Router Route Groups

### Public Auth Group: `src/app/(auth)/`
- `/login` — Staff authentication entrypoint
- `/forgot-password` — Password reset request flow
- `/reset-password` — Token-verified password reset confirmation
- `/verify-email` — Email verification callback route

### Protected Admin Group: `src/app/(dashboard)/admin/`
- `/admin` — Executive overview root
- `/admin/analytics` — Business intelligence & revenue metrics
- `/admin/products` — Product catalog, variants, pricing, & media slots
- `/admin/categories` — Category tree & specification templates
- `/admin/inventory` — Warehouse stock levels & ledger
- `/admin/suppliers` — Supplier directory
- `/admin/purchases` — Purchase orders & stock receiving
- `/admin/orders` — Order lifecycle state machine & invoice PDFs
- `/admin/abandoned-checkouts` — Abandoned cart recovery tracking
- `/admin/customers` — Customer profiles & account status
- `/admin/payments` — SSLCOMMERZ & COD payment reconciliation
- `/admin/fraud-detection` — Fraud rules & manual review queue
- `/admin/coupons` — Promotional discount codes
- `/admin/flash-sales` — Time-bound flash sale campaigns
- `/admin/shipping` — Delivery zones & courier rates
- `/admin/returns` — Return merchandise authorization (RMA)
- `/admin/refunds` — Refund processing & settlement ledger
- `/admin/reviews` — Product review moderation
- `/admin/reports` — Financial reports & expense tracking
- `/admin/notifications` — Real-time admin notification center
- `/admin/cms` — Banners, pages, branding settings, & revisions
- `/admin/staff` — Staff account management
- `/admin/roles-permissions` — RBAC role & permission management
- `/admin/audit-logs` — Immutable security & action logs
- `/admin/settings` — Platform configuration

### Internal API Route Handlers: `src/app/api/`
- `GET /api/health` — Liveness probe returning service metadata
- `GET|POST /api/auth/[...action]` — Strictly allowlisted BFF authentication proxy

