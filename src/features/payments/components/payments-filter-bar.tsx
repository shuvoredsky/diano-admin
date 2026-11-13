'use client';

import { useTransition } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTableQueryParams } from '@/lib/crud';
import {
  PAYMENT_PROVIDERS,
  PAYMENT_STATUS_OPTIONS,
} from '../constants/payments.constants';

export function PaymentsFilterBar() {
  const [, startTransition] = useTransition();
  const { searchParams, setFilter, resetFilters } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const orderId = searchParams.get('orderId') || '';
  const provider = searchParams.get('provider') || '';
  const status = searchParams.get('status') || '';

  const hasActiveFilters = Boolean(orderId || provider || status);

  const handleOrderIdChange = (value: string) => {
    startTransition(() => {
      setFilter('orderId', value ? value.trim() : null);
    });
  };

  const handleProviderChange = (value: string) => {
    startTransition(() => {
      setFilter('provider', value || null);
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
        {/* Order ID Filter */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID..."
            value={orderId}
            onChange={(e) => handleOrderIdChange(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
          {orderId && (
            <button
              type="button"
              onClick={() => handleOrderIdChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear order ID"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Provider Select */}
        <select
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          aria-label="Filter by payment provider"
        >
          <option value="">All Providers</option>
          {PAYMENT_PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Status Select */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          aria-label="Filter by payment status"
        >
          <option value="">All Statuses</option>
          {PAYMENT_STATUS_OPTIONS.map((s) => (
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
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto cursor-pointer"
        >
          <Filter className="h-3.5 w-3.5" />
          Reset Filters
        </Button>
      )}
    </div>
  );
}
