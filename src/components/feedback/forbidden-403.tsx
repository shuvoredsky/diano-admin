'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';

export interface Forbidden403Props {
  requiredPermissions?: string[];
  routePath?: string;
  title?: string;
  description?: string;
}

export function Forbidden403({
  requiredPermissions = [],
  routePath,
  title = '403 — Access Denied',
  description = 'You do not have the required administrative permissions to access this screen.',
}: Forbidden403Props) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>

      {routePath && (
        <div className="mt-3 rounded-lg bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
          {routePath}
        </div>
      )}

      {requiredPermissions.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-card p-3 max-w-md text-left">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Required Permission (At Least One):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {requiredPermissions.map((perm) => (
              <span
                key={perm}
                className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-foreground"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="gap-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={() => router.push('/admin')}
          className="gap-2 rounded-xl"
        >
          <LayoutDashboard className="h-4 w-4" /> Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
