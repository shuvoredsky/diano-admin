'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { SIDEBAR_NAV_GROUPS } from '@/components/layout/nav-config';
import { Forbidden403 } from '@/components/feedback/forbidden-403';
import { ShieldCheck, Loader2 } from 'lucide-react';

export interface AuthGateProps {
  children: ReactNode;
}

/**
 * Resolves required permission slugs for a given frontend route path
 * based on the canonical navigation map in ADMIN_PERMISSION_MAP.md / nav-config.ts.
 */
function getRequiredPermissions(pathname: string): string[] | null {
  for (const group of SIDEBAR_NAV_GROUPS) {
    for (const item of group.items) {
      if (item.href === pathname || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))) {
        return item.permissions || [];
      }
    }
  }
  return null;
}

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, hasAnyPermission, isSuperAdmin } = usePermissions();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnTo = encodeURIComponent(pathname);
      router.replace(`/login?returnTo=${returnTo}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // 1. Session Loading: Full-page brand splash preventing flash of protected content
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-mint border border-primary/20 text-primary-deep shadow-xs animate-pulse">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Verifying Secure Administrative Session...</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Connecting to DIANO backend in Asia/Dhaka standard time.
        </p>
      </div>
    );
  }

  // 2. Unauthenticated: hold empty state while redirecting to /login
  if (!isAuthenticated) {
    return null;
  }

  // 3. Permission Check for Current Route
  const requiredPermissions = getRequiredPermissions(pathname);
  if (requiredPermissions && requiredPermissions.length > 0 && !isSuperAdmin) {
    const isAllowed = hasAnyPermission(requiredPermissions);
    if (!isAllowed) {
      return (
        <Forbidden403
          routePath={pathname}
          requiredPermissions={requiredPermissions}
          title="403 — Unauthorized Section"
          description="Your administrative role does not include the required permissions for this screen."
        />
      );
    }
  }

  // 4. Authorized: render child dashboard content
  return <>{children}</>;
}
