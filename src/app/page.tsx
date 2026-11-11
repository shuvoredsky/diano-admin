import Link from 'next/link';
import { ADMIN_ROUTES, AUTH_ROUTES } from '@/constants/routes';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-lg border border-border bg-card p-6 text-card-foreground">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          DIANO E-Commerce Platform
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">DIANO Admin Portal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Phase 1 architectural foundation initialized (Next.js 16 App Router, TypeScript strict
          mode, Redux Toolkit, TanStack Query, Shadcn UI, and typed API infrastructure).
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
          <Link
            href={ADMIN_ROUTES.ROOT}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Go to Admin Workspace (/admin)
          </Link>
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="rounded-md border border-border px-4 py-2 hover:bg-accent"
          >
            Go to Staff Login (/login)
          </Link>
        </div>
      </div>
    </main>
  );
}

