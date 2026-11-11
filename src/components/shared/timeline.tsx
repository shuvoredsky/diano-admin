import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { DateText } from './date-text';
import { StatusBadge } from './status-badge';
import { CheckCircle2 } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string | null;
  timestamp: string | Date;
  status?: string | null;
  actor?: string | null;
  icon?: ReactNode;
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground italic">
        No event history recorded yet.
      </div>
    );
  }

  return (
    <div className={cn('relative pl-6 space-y-6', className)}>
      {/* Vertical connection line */}
      <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border/80" />

      {events.map((evt, idx) => (
        <div key={evt.id || idx} className="relative flex items-start gap-4">
          {/* Node Icon/Dot */}
          <div className="absolute -left-6 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-card ring-4 ring-card">
            {evt.icon || (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            )}
          </div>

          {/* Event Content */}
          <div className="flex-1 rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground tracking-tight">
                  {evt.title}
                </span>
                {evt.status && (
                  <StatusBadge status={evt.status} size="sm" />
                )}
              </div>
              <DateText date={evt.timestamp} format="datetime" className="text-[11px] text-muted-foreground" />
            </div>

            {evt.description && (
              <p className="mt-1.5 text-xs text-muted-foreground whitespace-pre-wrap">
                {evt.description}
              </p>
            )}

            {evt.actor && (
              <div className="mt-2 text-[10px] text-muted-foreground/80">
                Action by: <span className="font-medium text-foreground">{evt.actor}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
