export interface RoutePlaceholderProps {
  title: string;
  routePath?: string;
  route?: string;
  moduleName?: string;
  description?: string;
  requiredPermission?: string;
}

/**
 * Minimal architectural route foundation placeholder for Phase 1.
 * Actual Admin Dashboard visual UI will be implemented in subsequent milestones.
 */
export function RoutePlaceholder({
  title,
  routePath,
  route,
  moduleName,
  description,
  requiredPermission,
}: RoutePlaceholderProps) {
  const resolvedRoute = routePath ?? route ?? '/admin';
  const resolvedModule = moduleName ?? 'features/admin';

  return (
    <section
      aria-label={title}
      className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-6 text-card-foreground"
    >
      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
        DIANO Admin Architecture Foundation (Phase 1)
      </p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="font-medium text-foreground">Route Segment</dt>
          <dd className="font-mono text-xs">{resolvedRoute}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Feature Module</dt>
          <dd className="font-mono text-xs">{resolvedModule}</dd>
        </div>
        {requiredPermission ? (
          <div className="sm:col-span-2">
            <dt className="font-medium text-foreground">Backend RBAC Permission</dt>
            <dd className="font-mono text-xs">{requiredPermission}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
