'use client';

import { Activity, ShieldCheck, Clock } from 'lucide-react';
import { DateText } from '@/components/shared/date-text';
import type { PaymentEventItem } from '../types/payments.types';

export interface PaymentEventsSectionProps {
  events?: PaymentEventItem[];
}

export function PaymentEventsSection({ events = [] }: PaymentEventsSectionProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-xs text-muted-foreground">
        <Clock className="mx-auto h-5 w-5 mb-1.5 opacity-60" />
        No gateway events recorded for this payment yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-primary" />
          Gateway Event History ({events.length})
        </h4>
      </div>

      <div className="space-y-3 relative pl-4 border-l-2 border-primary/20 ml-2">
        {events.map((evt) => (
          <div key={evt.id} className="relative space-y-1">
            {/* Timeline bullet */}
            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />

            <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
              <span className="font-semibold text-foreground">
                {evt.eventType}
              </span>
              <div className="text-[11px] text-muted-foreground">
                <DateText date={evt.createdAt} format="long" />
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
              <span>Event ID: <code className="font-mono text-foreground">{evt.eventId}</code></span>
              {evt.signatureValid && (
                <span className="inline-flex items-center gap-0.5 text-primary text-[10px] font-medium">
                  <ShieldCheck className="h-3 w-3" />
                  Signature Valid
                </span>
              )}
            </div>

            {evt.rawPayloadRedacted && Object.keys(evt.rawPayloadRedacted).length > 0 && (
              <details className="mt-1">
                <summary className="text-[10px] text-primary cursor-pointer hover:underline">
                  View Redacted Gateway Payload
                </summary>
                <pre className="mt-1 rounded-md bg-muted/60 p-2 text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-32">
                  {JSON.stringify(evt.rawPayloadRedacted, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
