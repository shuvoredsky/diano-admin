# Agent Working Rules — DIANO Admin Dashboard (diano-admin)

This document establishes the binding architectural, operational, and development rules for all AI agents working on the `diano-admin` codebase. Read and follow these rules prior to starting every milestone.

---

### 1. Scope & Workspace Boundary
- **Workspace Boundary:** Work is strictly confined to `diano-admin`. Never search, read, or execute mutating commands outside this directory. `diano-server` is a READ-ONLY reference; `diano-client` is never touched.
- **Environment & Secrets:** Never print, log, inspect, or expose values in `.env` or any token/credential. Verify with `git ls-files | findstr /i "\.env"` that only `.env.example` is tracked.
- **Time Limits:** No command may run longer than 2 minutes. If a command hangs, kill it and use an alternate approach.
- **File Integrity:** Do not use PowerShell redirection (`>`) to write or modify source files as it introduces UTF-8 BOM markers. Use dedicated agent file editing tools.

### 2. Push Policy (Automated Per-Logical-Commit)
After EVERY logical commit, push to GitHub automatically, but ONLY if ALL of the following conditions are met:
1. `typecheck` and `lint` pass for that part (full test suite + production build are required before the final push of the phase).
2. `git ls-files | findstr /i "\.env"` shows only `.env.example`, and the commit contains no secrets/tokens/credentials.
3. Push command: `git push origin <current-branch>`.
   - NEVER use `--force` or `--force-with-lease`.
   - Never change the remote URL.
   - Never put a token in a URL.
   - Never touch git credentials or global git config.
4. If a push fails: do NOT retry in a loop and do NOT change credentials. Retry at most once; if it still fails, STOP, report the exact error message, and wait for user instruction.
5. After each push, report `git status -sb` (ahead/behind) in one concise line.

### 3. Layered Architecture & Reuse First Policy
- **Component & Hook Layers:**
  - `Features (components, hooks, api, types, constants)` -> `Shared Components (@/components/...)` -> `Core Lib & Utilities (@/lib/...)`.
  - Avoid logic duplication. Always search and reuse shared primitives before authoring new implementations:
    - Shared CRUD: `useTableQueryParams`, `mapBackendValidationErrors`, `useDirtyFormGuard`.
    - UI Components: `DataTable`, `FilterBar`, `FormField`, `ConfirmDialog`, `StatusBadge`, `MoneyText`, `DateText`, `Timeline`, `PermissionGate` / `<Can>`, `EmptyState`, `ErrorState`, `Skeletons`, `PageHeader`.
    - API & Auth: `browserApiClient`, `api`, `useAuthPermissions`, `usePermissions`.
- **Zero Mock Data in Production:** No fake endpoints, simulated responses, or mocked data inside production code. If an endpoint or field is absent in backend, record it in `docs/BACKEND_GAPS.md` and display an honest UI fallback.

### 4. Monetary & Timezone Standards
- **Monetary Precision:** All currency representations in BDT (৳) must use pure Decimal math / exact 2-decimal half-up arithmetic (`Intl.NumberFormat('en-BD')`). Never use raw IEEE-754 floating point arithmetic in calculations.
- **Timezone:** Display all transactional and operational timestamps in `Asia/Dhaka` (UTC+6) via `DateText`.

### 5. Project Decisions (Scope & Deploy Target)
1. **Payment Scope:**
   - Strictly **SSLCOMMERZ + Cash on Delivery (COD)** only.
   - bKash and Nagad are out of scope (render "Coming soon" or read-only indicator).
   - `PAYMENT_ENABLED_PROVIDERS` strictly contains only `COD` and `SSLCOMMERZ`.
2. **Deployment Platform:**
   - **Target Stack:** Vercel / Render + Next.js 16 (Turbopack).
   - **Strictly Prohibited:** Docker, Nginx, AWS, or container infrastructure files. Do not create `Dockerfile`, `docker-compose.yml`, or Nginx configs.
3. **Redis & Session Architecture:**
   - Zero hard dependency on Redis.
   - In-memory JWT access token store (volatile JS memory), HttpOnly refresh cookie via BFF `/api/auth/*`. Single-flight refresh queue and multi-tab synchronization via `navigator.locks`.

### 6. Execution & Quality Standards
- **Conventional Commits:** Use standard prefixes: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`. Commit per logical part.
- **Verification:** Real test outputs only (`passed`, `skipped`, `failed`). ESLint 0 warnings, 0 errors. TypeScript 0 errors. Zero `eslint-disable`, zero `as any`, zero `@ts-ignore` in `src`.
- **Testing Standard:** Unit tests with network/hook mocking using Vitest + React Testing Library. Never skip tests.

### 7. Reporting
- Concise milestone reports (maximum 40 lines).
