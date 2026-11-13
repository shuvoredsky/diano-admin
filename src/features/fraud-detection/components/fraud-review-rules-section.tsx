'use client';

import { AlertOctagon, CheckCircle2 } from 'lucide-react';
import type { TriggeredRuleItem } from '../types/fraud.types';

export interface FraudReviewRulesSectionProps {
  triggeredRules?: TriggeredRuleItem[] | null;
}

export function FraudReviewRulesSection({
  triggeredRules = [],
}: FraudReviewRulesSectionProps) {
  const rules = triggeredRules || [];

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <AlertOctagon className="h-4 w-4 text-warning" />
          Triggered Risk Signals ({rules.length})
        </h4>
      </div>

      {rules.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>No suspicious heuristic triggers recorded for this order.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground block">
                  {rule.name}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  {rule.reason}
                </span>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 font-mono text-[11px] font-bold text-destructive">
                  +{rule.points} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
