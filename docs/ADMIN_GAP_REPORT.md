# DIANO Admin Dashboard — Phase 1 Inspection & Gap Report (`ADMIN_GAP_REPORT.md`)

**Updated:** 2026-11-11 (Post Backend Patch Sync)
**Scope:** Verification of `diano-admin` against updated `../diano-server/openapi.json` (255 operations), `FRONTEND_HANDOFF.md`, `API_CONTRACT.md`, `SCHEMA_SUMMARY.md`, `ANALYTICS_DEFINITIONS.md`, `prisma/seed.ts`, and `src/sockets/`.

---

## 1. Real Workspace & Route Audit (`diano-admin`)

All 31 App Router routes in `diano-admin` currently compile and pass static/dynamic build generation.

| Route Path | Type | Current Frontend State | Functional vs Scaffold |
| :--- | :--- | :--- | :--- |
| `/` | Static Page | **Scaffold** | Links to `/admin` and `/login` |
| `/login` | Static Page | **Scaffold** | Form foundation prepared |
| `/forgot-password` | Static Page | **Scaffold** | Password reset request |
| `/reset-password` | Static Page | **Scaffold** | Password reset submission |
| `/verify-email` | Static Page | **Scaffold** | Verification token submission |
| `/admin` | Static Page | **Scaffold** | Dashboard overview |
| `/admin/analytics` | Static Page | **Scaffold** | Deep analytics & trends |
| `/admin/products` | Static Page | **Scaffold** | Products list & management |
| `/admin/categories` | Static Page | **Scaffold** | Category tree & specifications |
| `/admin/inventory` | Static Page | **Scaffold** | Stock overview & movements |
| `/admin/suppliers` | Static Page | **Scaffold** | Supplier registry |
| `/admin/purchases` | Static Page | **Scaffold** | Purchase order pipeline |
| `/admin/orders` | Static Page | **Scaffold** | Order management & dispatch |
| `/admin/abandoned-checkouts` | Static Page | **Scaffold** | Abandoned carts & recovery |
| `/admin/customers` | Static Page | **Scaffold** | Customer profiles & timelines |
| `/admin/payments` | Static Page | **Scaffold** | Transaction logs & COD reconciliation |
| `/admin/fraud-detection` | Static Page | **Scaffold** | Fraud assessment & review queue |
| `/admin/coupons` | Static Page | **Scaffold** | Promotion rules & discount engine |
| `/admin/flash-sales` | Static Page | **Scaffold** | Flash sale campaign creator |
| `/admin/shipping` | Static Page | **Scaffold** | Zones, methods & courier tracking |
| `/admin/returns` | Static Page | **Scaffold** | Return merchandise authorization |
| `/admin/refunds` | Static Page | **Scaffold** | Refund ledger & approval |
| `/admin/reviews` | Static Page | **Scaffold** | **Backend Active** (Moderation & rating API live) |
| `/admin/reports` | Static Page | **Scaffold** | Data export suite |
| `/admin/notifications` | Static Page | **Scaffold** | System alerts & notification queue |
| `/admin/cms` | Static Page | **Scaffold** | Banners & content pages |
| `/admin/staff` | Static Page | **Scaffold** | Internal staff management |
| `/admin/roles-permissions` | Static Page | **Scaffold** | Role definitions & permission matrix |
| `/admin/audit-logs` | Static Page | **Scaffold** | **Backend Active** (Audit trail query API live) |
| `/admin/settings` | Static Page | **Scaffold** | Store configuration & security policies |
| `/api/health` | Dynamic Route Handler | **Functional** | Returns `{ status: 'ok', service: 'diano-admin' }` |
| `/api/auth/[...action]` | Dynamic Route Handler | **Functional** | Allowlisted BFF proxy |
| `src/proxy.ts` | Next.js 16 Proxy | **Functional** | Session check + URL sanitizer |

---

## 2. Permission Slugs Audit (`diano-admin` vs `diano-server/prisma/seed.ts`)

- **`diano-server/prisma/seed.ts` (`permissionsData`):** Seeds **74** permission slugs.
- **`diano-admin/src/constants/permissions.ts` (`PERMISSIONS`):** Defines **74** permission slugs.
- **Status:** **100% IN SYNC**.
  - `customer:read` & `customer:manage`: Seeded and mapped.
  - `notification:manage`: Seeded and mapped.
  - `fraud:rule_manage`: Unified into `fraud:manage`.
  - `review:read` & `review:moderate`: Fully active.
  - `audit:view`: Fully active.
  - `GET /api/v1/auth/me`: Now directly returns `permissions: string[]` and `isSuperAdmin: boolean`.

---

## 3. OpenAPI Code Generation Tooling
- Added `scripts/generate-api-types.mjs` and npm script `npm run api:types`.
- Generated `src/lib/api/schema.d.ts` (267,924 bytes) directly from `../diano-server/openapi.json` (255 operations).
