# DIANO Admin Architecture Overview

## 1. Architectural Philosophy

`diano-admin` is architected using a **Feature-Based Modular Frontend Architecture** on top of the **Next.js 16 App Router**:

- **React Server Components (RSC) First:** Route layouts and pages default to Server Components for zero-bundle-cost shell rendering and metadata generation. `'use client'` boundaries are pushed down to interactive leaf components and providers.
- **Strict Separation of Concerns:**
  - `src/app/` owns routing, layouts, error boundaries, and Next.js Route Handlers.
  - `src/features/<domain>/` owns domain-specific API functions, TanStack Query factories, Zod schemas, TypeScript contracts, hooks, and domain components.
  - `src/lib/` owns framework-agnostic infrastructure (API client, auth token store, RBAC permission evaluation, `Asia/Dhaka` date formatting, BDT currency formatting).
  - `src/components/ui/` owns reusable, uncoupled design-system primitives (Shadcn UI).

## 2. High-Level System Topology

```
Browser (Admin Staff)
  │
  ├── Navigation Request (/admin/*, /login)
  │     └── Next.js 16 Proxy (src/proxy.ts)
  │           └── Optimistic check on HttpOnly `diano_refresh_token` cookie
  │
  ├── Auth Session Mutations (/api/auth/admin/login, /refresh, /logout)
  │     └── Next.js BFF Route Handler (src/app/api/auth/[...action]/route.ts)
  │           └── Forwards to BACKEND_API_URL/api/v1/auth/* with Origin header
  │           └── Bridges HttpOnly `diano_refresh_token` cookie onto Next.js origin (Path=/)
  │
  ├── Authenticated REST API Calls (/api/v1/*)
  │     └── Axios Browser Client (src/lib/api/browser-client.ts)
  │           └── Injects `Authorization: Bearer <in-memory-access-token>`
  │           └── Single-flight 401 refresh rotation via /api/auth/refresh
  │
  └── Real-Time Admin Telemetry (WebSocket)
        └── Socket.IO Client (src/services/socket.service.ts)
              └── Authenticates via `handshake.auth.token`
              └── Server auto-joins `admin:all` and `admin:perm:<slug>` rooms
```

## 3. Regional & Domain Standards

- **Market:** Bangladesh
- **Currency:** Bangladeshi Taka (`BDT`, symbol `৳`), formatted via `formatBdt()` in `src/lib/utils/currency.ts`.
- **Timezone:** `Asia/Dhaka` (`UTC+06:00`, no DST), formatted via `date-fns-tz` in `src/lib/dates/dhaka-date.ts`.

