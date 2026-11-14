'use client';

import { Activity, ShieldCheck, Clock } from 'lucide-react';
import { DateText } from '@/components/shared/date-text';
import type { PaymentEventItem } from '../types/payments.types';

export const ALLOWED_PAYLOAD_KEYS = new Set([
  'status',
  'tran_id',
  'val_id',
  'amount',
  'store_amount',
  'currency',
  'bank_tran_id',
  'card_type',
  'card_no',
  'card_issuer',
  'card_brand',
  'card_sub_brand',
  'card_issuer_country',
  'currency_type',
  'currency_amount',
  'tran_date',
  'error',
  'failedreason',
  'risk_level',
  'risk_title',
  'validated_on',
  'store_id',
]);

export function filterPayloadAllowlist(
  payload: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return {};
  const safe: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(payload)) {
    if (ALLOWED_PAYLOAD_KEYS.has(key)) {
      safe[key] = val;
    }
  }
  return safe;
}

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

            {(() => {
              const safePayload = filterPayloadAllowlist(evt.rawPayloadRedacted);
              if (Object.keys(safePayload).length === 0) return null;
              return (
                <details className="mt-1">
                  <summary className="text-[10px] text-primary cursor-pointer hover:underline">
                    View Redacted Gateway Payload
                  </summary>
                  <pre className="mt-1 rounded-md bg-muted/60 p-2 text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-32">
                    {JSON.stringify(safePayload, null, 2)}
                  </pre>
                </details>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
