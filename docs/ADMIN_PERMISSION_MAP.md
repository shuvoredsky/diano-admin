# DIANO Admin Sidebar & Route Permission Map (`ADMIN_PERMISSION_MAP.md`)

**Source of Truth:** `../diano-server/prisma/seed.ts` (72 permission slugs) and route-level `requirePermission(...)` declarations across `../diano-server/src/modules/*/*.routes.ts`.

> **Rule:** `super-admin` bypasses all permission checks. A sidebar group is rendered only if at least one child item is accessible to the authenticated staff member. Hiding UI elements is a UX convenience only—every route and mutation handles `403 Forbidden` gracefully.

---

## 1. Sidebar Navigation Permission Matrix

| Sidebar Group | Menu Item | Frontend Route | Required Permission Slug(s) (ANY of) | Backend Route Guard Verified |
| :--- | :--- | :--- | :--- | :--- |
| **OVERVIEW** | Dashboard | `/admin` | `analytics:view`, `order:read`, `inventory:read` | `GET /admin/analytics/overview` (`analytics:view`), `GET /inventory/summary` (`inventory:read`) |
| **OVERVIEW** | Analytics | `/admin/analytics` | `analytics:view` | `adminAnalyticsRouter` (`analytics:view`; finance fields require `analytics:view_finance`) |
| **CATALOG** | Products | `/admin/products` | `product:read` | `GET /products/admin/all` (`product:read`) |
| **CATALOG** | Categories | `/admin/categories` | `category:read` | `GET /categories/admin/all` (`category:read`) |
| **INVENTORY** | Stock Overview | `/admin/inventory` | `inventory:read` | `GET /inventory`, `GET /inventory/summary` (`inventory:read`) |
| **INVENTORY** | Suppliers | `/admin/suppliers` | `supplier:read`, `supplier:manage` | `GET /suppliers` (`supplier:read`) |
| **INVENTORY** | Purchase Orders | `/admin/purchases` | `supplier:read`, `supplier:manage` | `GET /purchase-orders` (`supplier:read`) |
| **INVENTORY** | Stock Audit | `/admin/inventory/audits` | `inventory:audit` | `GET/POST /inventory/audits` (`inventory:audit`) |
| **SALES & OPERATIONS** | Orders | `/admin/orders` | `order:read`, `order:manage` | `GET /admin/orders` (`order:read`) |
| **SALES & OPERATIONS** | Abandoned Checkouts | `/admin/abandoned-checkouts` | `abandoned_checkout:read`, `abandoned_checkout:manage` | `GET /abandoned-checkouts` (`abandoned_checkout:read`) |
| **SALES & OPERATIONS** | Shipping | `/admin/shipping` | `shipping:read`, `shipping:dispatch`, `shipping:manage` | `GET /admin/shipping/zones` (`shipping:read`, `shipping:manage`) |
| **SALES & OPERATIONS** | Returns | `/admin/returns` | `return:read`, `return:approve`, `return:inspect`, `return:manage` | `GET /admin/returns` (`return:read`, `return:manage`) |
| **SALES & OPERATIONS** | Refunds | `/admin/refunds` | `refund:read`, `refund:approve`, `refund:manage`, `payment:refund` | `GET /admin/refunds` (`refund:read`, `refund:manage`) |
| **CUSTOMERS** | Customers | `/admin/customers` | `user:read`, `order:read` *(plus `customer:read` in `customers.routes.ts`)* | `GET /customers` (`customer:read` in route middleware; see `BACKEND_GAPS.md` BG-11) |
| **CUSTOMERS** | Reviews | `/admin/reviews` | `review:read`, `review:moderate` | Backend module not implemented yet (`BACKEND_GAPS.md` BG-01) |
| **PAYMENTS & SECURITY** | Payments | `/admin/payments` | `payment:read`, `payment:manage` | `GET /admin/payments` (`payment:read`, `payment:manage`) |
| **PAYMENTS & SECURITY** | Fraud Detection | `/admin/fraud-detection` | `fraud:read`, `fraud:review`, `fraud:manage`, `fraud:rule_manage` | `GET /admin/fraud/reviews` (`fraud:review`, `fraud:manage`) |
| **MARKETING** | Coupons | `/admin/coupons` | `coupon:read`, `coupon:manage` | `GET /admin/coupons` (`coupon:read`, `coupon:manage`) |
| **MARKETING** | Flash Sales | `/admin/flash-sales` | `coupon:manage` | `POST /admin/flash-sales` (`coupon:manage`) |
| **REPORTING** | Reports | `/admin/reports` | `report:export` | `POST /admin/reports/*` (`report:export`; financial requires `analytics:view_finance`) |
| **REPORTING** | Expenses | `/admin/expenses` | `expense:manage` | `GET/POST /admin/expenses` (`expense:manage`) |
| **MANAGEMENT** | CMS | `/admin/cms` | `banner:manage`, `page:manage`, `settings:read` | `bannersRouter` (`banner:manage`), `pagesRouter` (`page:manage`) |
| **MANAGEMENT** | Notifications | `/admin/notifications` | `notification:read`, `notification:send` | `GET /admin/notifications` (`notification:read`) |
| **MANAGEMENT** | Staff | `/admin/staff` | `user:read`, `user:manage` | `GET /users` (`user:read`) |
| **MANAGEMENT** | Roles & Permissions | `/admin/roles-permissions` | `role:read`, `role:update`, `role:create` | `GET /roles`, `GET /permissions` (`role:read`) |
| **MANAGEMENT** | Audit Logs | `/admin/audit-logs` | `audit:view` | Backend module not implemented yet (`BACKEND_GAPS.md` BG-02) |
| **MANAGEMENT** | Settings | `/admin/settings` | `settings:read`, `settings:update` | `GET /settings/:group` (`settings:read`), `PATCH /settings/:group` (`settings:update`) |

---

## 2. Field-Level Cost & Finance Visibility Slugs

| Sensitive Data Domain | Required Permission Slug | Fallback When Omitted by Backend |
| :--- | :--- | :--- |
| Analytics COGS, Gross Profit, Net Profit, Expenses, Gateway Fees | `analytics:view_finance` | Render `"No access"` badge or hide card; never render `৳0.00`. |
| Product Variant `costPrice` | `product:view_cost` | Hide cost input/column or display `"Restricted"`. |
| Inventory Valuation (`stockValue`, `damageValue`, `netStockValue`) | `inventory:view_cost` | Render `"No access"` on valuation KPI cards; never render `৳0.00`. |
| Order Item `costPrice` & Margin | `order:view_cost` | Omit cost/margin columns in Order Detail view. |
| Report Customer PII Columns (Phone, Email, Address) | `report:export_pii` | Backend masks/omits PII columns automatically; UI shows notice when `report:export_pii` is absent. |

