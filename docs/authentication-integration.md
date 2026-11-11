# Authentication & RBAC Integration

## 1. Backend Authentication Contract (`diano-server`)

Inspection of `diano-server/src/modules/auth/` established the following production contracts:

| Endpoint | Method | Purpose | Cookie / Token Behavior |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/admin/login` | `POST` | Staff-only login (rejects customer-only accounts with `403 FORBIDDEN`) | Returns `{ user, accessToken }` in JSON body; sets HttpOnly cookie `diano_refresh_token` |
| `/api/v1/auth/refresh` | `POST` | Refresh token rotation + reuse detection | Reads `diano_refresh_token` cookie; requires trusted `Origin` or `Referer` header (`verifyCookieOrigin`); returns new `{ user, accessToken }` and rotated cookie |
| `/api/v1/auth/logout` | `POST` | Revokes active session | Requires `verifyCookieOrigin`; clears `diano_refresh_token` |
| `/api/v1/auth/logout-all` | `POST` | Revokes all sessions for current user | Requires `Authorization: Bearer` + `verifyCookieOrigin` |
| `/api/v1/auth/me` | `GET` | Fetches current authenticated user summary | Requires `Authorization: Bearer`; returns `{ id, email, name, phone, avatarUrl, roles: string[] }` |

## 2. Solving the Cross-Origin & Path-Scoped Cookie Boundary

In `diano-server/src/modules/auth/auth.controller.ts`, `diano_refresh_token` is set with:
- `httpOnly: true`
- `path: '/api/v1/auth'`
- Host bound to the API server (`localhost:5000` in dev, Render URL in prod)

Because browser navigation requests to Next.js routes (`/admin/*`, `/login` on `localhost:3001`) neither match path `/api/v1/auth` nor share the backend port/host, the browser would never send the backend's cookie directly to Next.js `src/proxy.ts`.

### The BFF Auth Route Handler (`src/app/api/auth/[...action]/route.ts`)
To maintain `HttpOnly` cookie security while enabling Next.js `src/proxy.ts` and Server Components to detect session state:
1. All auth cookie endpoints (`admin/login`, `refresh`, `logout`, `logout-all`, `me`) are proxied through `/api/auth/[...action]`.
2. The Route Handler enforces a strict allowlist of actions (preventing SSRF/open proxy abuse).
3. It forwards `Origin: NEXT_PUBLIC_APP_URL` so `diano-server`'s `verifyCookieOrigin` CSRF middleware validates the request.
4. When `diano-server` rotates or clears `diano_refresh_token`, the Route Handler mirrors that `HttpOnly`, `SameSite=Lax`, `Path=/` cookie onto the Next.js origin.

## 3. Token Storage Policy

- **Access Token:** Stored exclusively in JavaScript memory (`src/lib/auth/token-store.ts`). Never written to `localStorage` or `sessionStorage`.
- **Refresh Token:** Stored exclusively in an `HttpOnly` cookie (`diano_refresh_token`). Never accessible to client-side JavaScript.

## 4. Role Hierarchy & Permission Guards

`src/constants/auth.ts` and `src/constants/permissions.ts` mirror `diano-server/src/constants/roles.ts` and `permissions.ts`:
- **System Roles:** `super-admin` (100), `admin` (80), `manager` (60), `support` (40), `warehouse` (30), `customer` (10).
- **72 Permission Slugs:** Defined in `PERMISSIONS` (`product:read`, `order:status_update`, `fraud:manage`, etc.).
- **Note on `/api/v1/auth/me`:** Returns `roles: string[]`. `super-admin` and `admin` roles automatically satisfy all permission checks via `hasFullAdminAccess(user)`, while granular role permissions for `manager`, `support`, and `warehouse` can be supplied to `hasPermission(user, permission, grantedPermissions)`.

