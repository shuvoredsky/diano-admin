# DIANO Admin Dashboard — Project Progress Tracker

**Last Updated:** 2026-11-15 (Post Phase 8A: Coupons & Flash Sales & Dashboard Alignment)

---

## Milestone Execution Summary

| Phase | Domain / Milestone | Scope & Deliverables | Status | Commits |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 0–4** | **Foundation, Auth, Catalog, Users** | BFF auth, RBAC permissions, products & variants CRUD, categories, media slots, customers, and staff management. | **COMPLETED** | Pushed |
| **Phase 5** | **Inventory & Supply Chain** | Multi-warehouse inventory, stock adjustments, ledger audit log, low-stock alerts, purchase orders, and physical stock audits (with atomicity locks BG-22/BG-23). | **COMPLETED** | `0751a5a`, etc. |
| **Phase 6A/B** | **Orders, Abandoned Checkouts, Payments, Fraud** | Order state machine, timeline, transitions, shipments hook, abandoned checkout recovery, SSLCOMMERZ/COD payment history, fraud scoring rules & review queue. | **COMPLETED** | `5a2ab2b` to `b6f3b24` |
| **Phase 7A/B** | **Shipping, Logistics, Returns & Refunds** | Shipping zones, methods, and weight-based charges; shipment courier tracking and checkpoints; customer return inspection (good vs damaged restock ledger trigger); gateway & order refund authorizations (with BG-27 gap logged). | **COMPLETED** | `803c547`, `6161f71`, `27579c6`, `0868b2b`, `1e9aa9e`, `3ae7d49` |
| **Dashboard** | **Executive Overview & KPI Alignment** | 12 required KPI cards (Total Orders, Undelivered Orders, Delivered Sales, Gross Sales, Discounts, Net Sales, Total Products, Total Stock Units, Stock Value, Damaged Qty, Damage Value, Net Stock Value). All 11 Dhaka reporting periods (`today`, `yesterday`, `last_7_days`, `last_30_days`, `this_week`, `last_week`, `this_month`, `last_month`, `this_year`, `last_year`, `custom`) with previous period comparison and `inventory:view_cost` access protection. | **COMPLETED** | `36b93b6` |
| **Phase 8A** | **Coupons & Flash Sales** | Promotional discount vouchers CRUD (percentage, fixed BDT, free shipping, minimum order spend, maximum discount caps, per-user limits, usage limits, Dhaka schedule, dirty form guard, double-submit protection). Time-gated flash sale campaigns creation with dynamic variant allocation and BG-06 honest API handling. Full unit test coverage and zero lint/typecheck errors. | **COMPLETED** | `12f3ccc` |
| **Phase 8B** | **Reviews Moderation, Reports Export, Expenses** | Next milestone (Pending). | **PENDING** | — |

---

## Quality Metrics & Standards Compliance
- **TypeScript:** Strict mode enabled, 0 type errors (`tsc --noEmit`).
- **ESLint:** Strict next/core-web-vitals + TypeScript rules, 0 errors, 0 warnings.
- **Unit Tests:** Vitest + React Testing Library across all feature suites.
- **Secrets & Security:** Only `.env.example` tracked; zero leaked credentials.
- **Design Tokens:** Strict pastel palettes, BDT currency half-up decimal math, Asia/Dhaka timestamps (`DateText`).
