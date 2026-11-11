# State Management Strategy

`diano-admin` enforces a strict boundary between **Server State** (TanStack Query v5) and **Client UI State** (Redux Toolkit v2).

## 1. TanStack React Query (`src/lib/query/query-client.ts`)

**Used exclusively for asynchronous server data:**
- Admin catalog, inventory, orders, customers, analytics, and RBAC resources.
- Hierarchical query keys defined per feature (e.g., `PRODUCT_QUERY_KEYS`, `AUTH_QUERY_KEYS`).
- **Default Configuration:**
  - `staleTime`: 60 seconds
  - `gcTime`: 5 minutes
  - `refetchOnWindowFocus`: `false` (prevents unexpected form resets during admin editing)
  - **Smart Retry Policy:** Never retries `401`, `403`, `404`, or `422` client errors; retries transient network/5xx errors up to 2 times.

## 2. Redux Toolkit (`src/store/`)

**Used exclusively for synchronous, client-only UI preferences:**
- `uiSlice` (`src/store/slices/ui.slice.ts`):
  - `sidebarCollapsed: boolean`
  - `mobileSidebarOpen: boolean`
  - `commandPaletteOpen: boolean`
  - `tableDensity: 'comfortable' | 'compact'`
- Typed hooks in `src/store/hooks.ts`: `useAppDispatch()` and `useAppSelector()`.
- Wrapped per-render-tree via `StoreProvider` (`src/store/provider.tsx`) to remain safe with Next.js App Router concurrent rendering.

## 3. Anti-Patterns Prohibited

- Never store API response payloads inside Redux slices.
- Never store JWT access or refresh tokens in Redux or `localStorage`.
- Never duplicate filter/pagination state in Redux when URL search params or TanStack Query keys own it.

