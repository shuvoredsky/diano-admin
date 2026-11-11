# DIANO Admin Dashboard (`diano-admin`)

Production-grade Next.js 16 (App Router) administration platform for the **DIANO** e-commerce ecosystem in Bangladesh (`BDT / ৳`, `Asia/Dhaka` timezone).

> **Current Phase:** Phase 1 — Professional Next.js Architecture, Project Setup & Dependency Installation (Foundation Only).

## Tech Stack

- **Framework:** Next.js `16.4.6` (App Router, React Server Components by default, Turbopack dev server, Next.js 16 `proxy.ts` convention)
- **UI & Styling:** React `19.3.1`, Tailwind CSS `4.3.5`, Shadcn UI / Radix Primitives, Lucide Icons, `next-themes`, `sonner`
- **State Management:** TanStack React Query v5 (`@tanstack/react-query`) for server state + Redux Toolkit v2 (`@reduxjs/toolkit`) for client UI preferences
- **API & Real-Time:** Axios (`axios`) with single-flight token refresh queue + Socket.IO Client (`socket.io-client`)
- **Validation & Forms:** Zod v4 + React Hook Form v7 + `@hookform/resolvers`
- **Date & Currency:** `date-fns` v4 + `date-fns-tz` v3 (`Asia/Dhaka`), BDT (`৳`) formatting utilities
- **Testing & Quality:** TypeScript `6.0.3` (strict mode), ESLint v10, Prettier v3, Vitest v5, React Testing Library, Playwright

## Quick Start

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server (port `3001` via Turbopack):
   ```bash
   npm run dev
   ```

## Quality Gate Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Start Next.js 16 development server with Turbopack on port `3001` |
| `npm run build` | Production build verification |
| `npm run start` | Start production server on port `3001` |
| `npm run lint` | Run ESLint across `src/` and `tests/` |
| `npm run typecheck` | Run `tsc --noEmit` strict type verification |
| `npm test` | Run Vitest unit & component tests once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:e2e` | Run Playwright E2E smoke tests |
| `npm run format` | Format codebase with Prettier |
| `npm run format:check` | Verify formatting with Prettier |

## Documentation Index

- [Architecture Overview](docs/architecture.md)
- [Routing & Proxy Guard](docs/routing.md)
- [Authentication & RBAC Integration](docs/authentication-integration.md)
- [API & Socket.IO Integration](docs/api-integration.md)
- [State Management Strategy](docs/state-management.md)
- [Development Setup Guide](docs/development-setup.md)
- [Project Folder Structure](docs/project-structure.md)
- [Technical Decisions & Backend Discrepancies](docs/technical-decisions.md)
- [Project Progress Tracker](PROJECT_PROGRESS.md)

