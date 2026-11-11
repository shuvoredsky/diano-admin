import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { CardSkeleton } from '@/components/feedback/skeletons';
import { AlertCircle } from 'lucide-react';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ChartCard({
  title,
  subtitle,
  badge,
  actions,
  loading = false,
  error,
  empty = false,
  emptyMessage = 'No chart data available for this period.',
  children,
  className,
  contentClassName,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs transition-shadow hover:shadow-xs',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-base tracking-tight">{title}</h3>
            {badge}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Content Area */}
      <div className={cn('relative min-h-[260px] w-full flex-1', contentClassName)}>
        {loading ? (
          <div className="flex h-full min-h-[260px] w-full items-center justify-center">
            <CardSkeleton className="h-full min-h-[260px] w-full" />
          </div>
        ) : error ? (
          <div className="flex h-full min-h-[260px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-xs text-destructive">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="font-semibold text-sm">Failed to load chart data</p>
            <p className="text-muted-foreground max-w-sm">{error}</p>
          </div>
        ) : empty ? (
          <div className="flex h-full min-h-[260px] w-full items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
