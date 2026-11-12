# Agent Working Rules — DIANO Admin Dashboard (diano-admin)

This document establishes the binding architectural, operational, and development rules for all AI agents working on the `diano-admin` codebase. Read and follow these rules prior to starting every milestone.

---

### 1. Scope & Workspace Boundary
- **Workspace Boundary:** Work is strictly confined to `diano-admin`. Never search, read, or execute mutating commands outside this directory. `diano-server` is READ-ONLY reference; `diano-client` is never touched.
- **Environment & Secrets:** Never print, log, inspect, or expose values in `.env` or any token/credential. Verify with `git ls-files | findstr /i "\.env"` that only `.env.example` is tracked.
- **Time Limits:** No command may run longer than 2 minutes. If a command hangs, kill it and use an alternate approach.

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

### 3. Execution & Quality Standards
- **Conventional Commits:** Use standard prefixes: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`. Commit per logical part.
- **Verification:** Real test outputs only (`passed`, `skipped`, `failed`). ESLint 0 warnings, 0 errors. TypeScript 0 errors. Zero `eslint-disable`, zero `as any`, zero `@ts-ignore` in `src`.
- **Zero Mock Data in Production:** No fake endpoints, simulated responses, or mocked data inside production code. If an endpoint or field is absent in backend, record it in `docs/BACKEND_GAPS.md` and display an honest UI fallback.
- **Reuse Infrastructure First:** Always reuse shared CRUD primitives: `useTableQueryParams`, `mapBackendValidationErrors`, `useDirtyFormGuard`, `DataTable`, `FilterBar`, `FormField`, `ConfirmDialog`, `StatusBadge`, `MoneyText`, `DateText`, `PermissionGate`, `EmptyState`, `ErrorState`, `Skeletons`, `PageHeader`, and API clients.

### 4. Monetary & Timezone Standards
- **Monetary Precision:** All currency representations in BDT (৳) must use pure Decimal math / exact 2-decimal half-up arithmetic (`Intl.NumberFormat('en-BD')`). Never use raw IEEE-754 floating point arithmetic in calculations.
- **Timezone:** Display all transactional and operational timestamps in `Asia/Dhaka` (UTC+6) via `DateText`.

### 5. Reporting
- Concise milestone reports (maximum 40 lines).
