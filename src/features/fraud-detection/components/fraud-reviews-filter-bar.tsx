'use client';

import { useTransition } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTableQueryParams } from '@/lib/crud';
import {
  FRAUD_RISK_OPTIONS,
  FRAUD_STATUS_OPTIONS,
} from '../constants/fraud.constants';

export function FraudReviewsFilterBar() {
  const [, startTransition] = useTransition();
  const { searchParams, setFilter, resetFilters } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const riskLevel = searchParams.get('riskLevel') || '';
  const status = searchParams.get('status') || '';

  const hasActiveFilters = Boolean(riskLevel || status);

  const handleRiskChange = (value: string) => {
    startTransition(() => {
      setFilter('riskLevel', value || null);
    });
  };

  const handleStatusChange = (value: string) => {
    startTransition(() => {
      setFilter('status', value || null);
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Risk Level Filter */}
        <select
          value={riskLevel}
          onChange={(e) => handleRiskChange(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          aria-label="Filter by fraud risk level"
        >
          <option value="">All Risk Tiers</option>
          {FRAUD_RISK_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Review Status Filter */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          aria-label="Filter by review status"
        >
          <option value="">All Review Statuses</option>
          {FRAUD_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => resetFilters()}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer self-start sm:self-auto"
        >
          <Filter className="h-3.5 w-3.5" />
          Reset Filters
        </Button>
      )}
    </div>
  );
}
