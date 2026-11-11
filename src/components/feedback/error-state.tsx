import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while processing your request.',
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3 shadow-2xs">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{message}</p>
      <div className="mt-5 flex items-center gap-3">
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="flex items-center gap-2 rounded-lg"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}
