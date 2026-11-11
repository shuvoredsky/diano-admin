# API & Real-Time Socket.IO Integration

## 1. Centralized REST API Layer (`src/lib/api/`)

All communication with `diano-server` (`/api/v1`) flows through typed clients in `src/lib/api/`:

### Browser Client (`src/lib/api/browser-client.ts`)
- Built on **Axios** with `baseURL: NEXT_PUBLIC_API_BASE_URL` and `withCredentials: true`.
- **Request Interceptor:** Reads the in-memory access token from `getAccessToken()` and attaches `Authorization: Bearer <token>`.
- **Response Interceptor (Single-Flight 401 Refresh):**
  - When a protected endpoint returns `401 Unauthorized`, the interceptor triggers a single POST to `/api/auth/refresh`.
  - Concurrent requests that fail with `401` while refresh is in progress are queued in memory and replayed automatically with the new access token once rotation succeeds.
  - If refresh fails (expired or revoked session), the in-memory token is cleared and the browser redirects cleanly to `/login?returnUrl=...`.
- **Typed Helper Methods:** `apiGet<T>()`, `apiPost<T, B>()`, `apiPatch<T, B>()`, `apiPut<T, B>()`, `apiDelete<T>()`, and `createRequestController()` (`AbortController`).

### Server Fetch Client (`src/lib/api/server-client.ts`)
- Uses `getServerEnv().BACKEND_API_URL` (fallback `NEXT_PUBLIC_API_BASE_URL`) for React Server Components and Next.js Route Handlers.
- Normalizes non-2xx responses into `ApiClientError`.

## 2. Standard Response & Error Envelopes (`src/types/api.types.ts`)

Aligned with `diano-server/src/utils/api-response.ts`:
- **Success Envelope (`ApiSuccessResponse<T>`):**
  ```ts
  {
    success: true;
    message: string;
    data: T;
    meta?: {
      pagination?: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }
  ```
- **Error Envelope (`ApiErrorResponse` -> `ApiClientError`):**
  ```ts
  {
    success: false;
    message: string;
    error: {
      code: string;
      details?: Array<{ field?: string; message: string; code?: string }>;
    };
    requestId?: string;
  }
  ```

## 3. Typed Socket.IO Client (`src/services/socket.service.ts`)

Aligned with `diano-server/src/sockets/socket.server.ts` and `socket.types.ts`:
- **Connection:** Connects lazily via `connectAdminSocket()` ONLY when an in-memory access token exists, passing `auth: { token }`.
- **Server-Managed Rooms:** `diano-server` automatically joins authenticated staff sockets to `admin:all` and permission-scoped rooms (`admin:perm:<slug>`) during the handshake. Client-emitted `join` / `subscribe` / `room:*` events are explicitly blocked by the server.
- **Typed Server-to-Client Events (`ServerToClientEvents`):**
  - `order:new`
  - `order:status`
  - `payment:status`
  - `stock:low`
  - `checkout:abandoned`
  - `fraud:review`
  - `notification:new`

