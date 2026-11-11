import Link from 'next/link';
import { ADMIN_ROUTES } from '@/constants/routes';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">404</p>
      <h1 className="text-xl font-semibold">Page Not Found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The requested administrative route does not exist.
      </p>
      <Link
        href={ADMIN_ROUTES.ROOT}
        className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Return to Admin Overview
      </Link>
    </main>
  );
}

