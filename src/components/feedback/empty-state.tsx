import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/50 text-primary-deep dark:bg-mint/20 dark:text-primary mb-4 shadow-2xs">
        {icon || <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
