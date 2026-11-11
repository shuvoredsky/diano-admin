# Project Folder Structure

```text
diano-admin/
├── docs/                               # Architecture & engineering documentation
├── public/                             # Static assets
├── src/
│   ├── proxy.ts                        # Official Next.js 16 Proxy convention (optimistic route guard)
│   ├── app/
│   │   ├── (auth)/                     # Public authentication route group
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   ├── (dashboard)/
│   │   │   └── admin/                  # Protected admin route group (/admin & 24 domain sub-routes)
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── analytics/page.tsx
│   │   │       ├── products/page.tsx
│   │   │       ├── categories/page.tsx
│   │   │       ├── inventory/page.tsx
│   │   │       ├── suppliers/page.tsx
│   │   │       ├── purchases/page.tsx
│   │   │       ├── orders/page.tsx
│   │   │       ├── abandoned-checkouts/page.tsx
│   │   │       ├── customers/page.tsx
│   │   │       ├── payments/page.tsx
│   │   │       ├── fraud-detection/page.tsx
│   │   │       ├── coupons/page.tsx
│   │   │       ├── flash-sales/page.tsx
│   │   │       ├── shipping/page.tsx
│   │   │       ├── returns/page.tsx
│   │   │       ├── refunds/page.tsx
│   │   │       ├── reviews/page.tsx
│   │   │       ├── reports/page.tsx
│   │   │       ├── notifications/page.tsx
│   │   │       ├── cms/page.tsx
│   │   │       ├── staff/page.tsx
│   │   │       ├── roles-permissions/page.tsx
│   │   │       ├── audit-logs/page.tsx
│   │   │       └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...action]/route.ts # Allowlisted BFF Auth Proxy Route Handler
│   │   │   └── health/route.ts           # Service health check endpoint
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── feedback/                   # Empty states, alerts, confirmation primitives
│   │   ├── forms/                      # Reusable React Hook Form + Zod helpers
│   │   ├── layout/                     # Shell layout contracts
│   │   ├── providers/                  # Redux, TanStack Query, Theme, and Sonner providers
│   │   ├── shared/                     # RoutePlaceholder, ChartContainer (Recharts wrapper)
│   │   ├── tables/                     # Data table infrastructure contracts
│   │   └── ui/                         # Shadcn UI primitives (Button, Input, Label)
│   ├── config/
│   │   └── env.ts                      # Zod-validated public & server environment config
│   ├── constants/
│   │   ├── auth.ts                     # Cookie names, role slugs, role hierarchy
│   │   ├── permissions.ts              # All 72 backend RBAC permission slugs
│   │   └── routes.ts                   # Centralized route path constants
│   ├── features/                       # 25 domain-driven vertical feature slices
│   │   ├── auth/                       # Reference slice (api, queries, schemas, types, constants)
│   │   ├── products/                   # Reference slice (api, queries, schemas, types, constants)
│   │   └── ...                         # Remaining 23 modular domain directories
│   ├── hooks/
│   │   └── use-debounce.ts             # Reusable client hooks
│   ├── lib/
│   │   ├── api/                        # Axios browser client, server client, error normalizer
│   │   ├── auth/                       # In-memory token store & proxy guard logic
│   │   ├── dates/                      # Asia/Dhaka date-fns-tz utilities
│   │   ├── permissions/                # RBAC permission & role evaluation helpers
│   │   ├── query/                      # TanStack QueryClient factory
│   │   ├── utils/                      # cn() and BDT (৳) currency formatting
│   │   └── validations/                # Shared Zod schemas (UUID, pagination, BDT, BD phone)
│   ├── services/
│   │   └── socket.service.ts           # Typed Socket.IO client service
│   ├── store/                          # Redux Toolkit store, typed hooks, & uiSlice
│   ├── styles/
│   │   └── theme.css                   # Design tokens & theme variables
│   └── types/                          # Global API & authentication TypeScript contracts
└── tests/
    ├── e2e/smoke.spec.ts               # Playwright E2E smoke test
    ├── unit/                           # Vitest + React Testing Library unit/component suites
    └── setup.ts
```

