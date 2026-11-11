# Development Setup Guide

## 1. Prerequisites

- **Node.js:** v20.11+ (verified on `v26.13.0`)
- **npm:** v10+ (verified on `11.20.0`)
- **Backend (`diano-server`):** Running locally on `http://localhost:5000` (default) for live API integration.

## 2. Environment Configuration

Copy `.env.example` to `.env.local` inside `diano-admin/`:

```env
NEXT_PUBLIC_APP_NAME="DIANO Admin"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXT_PUBLIC_API_BASE_URL="http://localhost:5000/api/v1"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
NEXT_PUBLIC_DEFAULT_LOCALE="en-BD"
NEXT_PUBLIC_CURRENCY_CODE="BDT"
NEXT_PUBLIC_CURRENCY_SYMBOL="৳"
NEXT_PUBLIC_TIMEZONE="Asia/Dhaka"

# Server-only internal backend URL
BACKEND_API_URL="http://localhost:5000/api/v1"
```

> **Security Rule:** Never place secrets, private keys, or database credentials in `.env.local` or `NEXT_PUBLIC_*` variables.

## 3. Backend CORS Origin Requirement

Ensure `diano-server/.env` includes `http://localhost:3001` in `CORS_ORIGINS` (or `ADMIN_ORIGIN=http://localhost:3001`) so `verifyCookieOrigin` and CORS middleware allow requests from `diano-admin`.

## 4. Running & Verifying the Project

```bash
# Start development server with Turbopack on http://localhost:3001
npm run dev

# Run TypeScript strict check
npm run typecheck

# Run ESLint
npm run lint

# Run Vitest unit & component smoke tests
npm test

# Build for production
npm run build
```

