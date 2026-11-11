# Technical Decisions & Backend Discrepancies Log

During Milestone 1 (Backend Contract Inspection), we audited `diano-server/src` against `diano-server/docs/FRONTEND_HANDOFF.md` and `docs/API_CONTRACT.md`. The following architectural decisions and real-code alignments were implemented in `diano-admin` without modifying `diano-server`:

## 1. Refresh Cookie Path & Cross-Origin Scope (`diano_refresh_token`)
- **Backend Reality (`diano-server/src/modules/auth/auth.controller.ts`):** Sets `diano_refresh_token` with `path: '/api/v1/auth'` on the backend origin.
- **Architectural Impact:** Browser requests to Next.js routes (`/admin/*`, `/login`) on the frontend origin will never carry a cookie scoped to `path: '/api/v1/auth'` on the backend origin.
- **Decision:** Implemented a strictly allowlisted Next.js BFF Route Handler (`src/app/api/auth/[...action]/route.ts`) that proxies auth operations (`admin/login`, `refresh`, `logout`, `logout-all`, `me`) to `BACKEND_API_URL`, attaches the trusted `Origin` header required by `verifyCookieOrigin`, and mirrors `diano_refresh_token` onto the Next.js origin with `Path=/` and `HttpOnly`.

## 2. Pagination Envelope Structure (`meta.pagination` vs `pagination`)
- **Backend Reality (`diano-server/src/utils/api-response.ts`):** `sendSuccess()` nests pagination inside `meta: { pagination: { page, limit, totalItems, totalPages, hasNextPage, hasPrevPage } }`, whereas `API_CONTRACT.md` depicted top-level `pagination`.
- **Decision:** `ApiSuccessResponse<T>` in `src/types/api.types.ts` types `meta?.pagination` as primary and retains optional top-level `pagination` for backward compatibility.

## 3. `/api/v1/auth/me` Payload (`roles` vs `permissions`)
- **Backend Reality (`diano-server/src/modules/auth/auth.service.ts`):** `getProfile()` returns `{ id, email, name, phone, avatarUrl, roles: string[] }` (`AuthUserSummary`), not expanded permission strings.
- **Decision:** `src/lib/permissions/permission-guard.ts` grants full access automatically for `super-admin` and `admin` roles (`hasFullAdminAccess`) and accepts `grantedPermissions` resolved from `/api/v1/roles` for custom/staff roles (`manager`, `support`, `warehouse`).

## 4. Socket.IO Event Naming & Server-Enforced Room Joining
- **Backend Reality (`diano-server/src/sockets/socket.server.ts` & `socket.types.ts`):**
  - Actual emitted event names are `order:new`, `order:status`, `payment:status`, `stock:low`, `checkout:abandoned`, `fraud:review`, and `notification:new` (differing from `FRONTEND_HANDOFF.md` which listed `order:created`, `order:status_changed`, `inventory:low_stock`).
  - Client-emitted room join events (`join`, `subscribe`, `room:*`) are explicitly rejected by `socket.server.ts`. Rooms (`admin:all` and `admin:perm:<slug>`) are assigned automatically during the JWT handshake.
- **Decision:** `src/services/socket.service.ts` types `ServerToClientEvents` to match `socket.types.ts` exactly and relies on handshake authentication rather than client room-join events.

