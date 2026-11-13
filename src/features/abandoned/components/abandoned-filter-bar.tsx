'use client';

import { useTransition } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTableQueryParams } from '@/lib/crud';
import { CHECKOUT_STATUS_LABELS } from '../constants/abandoned.constants';
import type { CheckoutStatus } from '../types/abandoned.types';

export function AbandonedFilterBar() {
  const [, startTransition] = useTransition();
  const { searchParams, setFilter, resetFilters } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const status = searchParams.get('status') || '';
  const fromDate = searchParams.get('fromDate') || '';
  const toDate = searchParams.get('toDate') || '';

  const hasActiveFilters = Boolean(status || fromDate || toDate);

  const handleStatusChange = (value: string) => {
    startTransition(() => {
      setFilter('status', value || null);
    });
  };

  const handleFromDateChange = (value: string) => {
    startTransition(() => {
      setFilter('fromDate', value || null);
    });
  };

  const handleToDateChange = (value: string) => {
    startTransition(() => {
      setFilter('toDate', value || null);
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Status Select */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          aria-label="Filter by status"
          className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
        >
          <option value="">All Statuses</option>
          {(['ACTIVE', 'ABANDONED', 'RECOVERED', 'CONVERTED', 'EXPIRED'] as CheckoutStatus[]).map((st) => (
            <option key={st} value={st}>
              {CHECKOUT_STATUS_LABELS[st] || st}
            </option>
          ))}
        </select>

        {/* Date Filter Inputs */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="From Date"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            aria-label="To Date"
            value={toDate}
            onChange={(e) => handleToDateChange(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
          />
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => resetFilters()}
            className="h-9 gap-1.5 px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        <span>Filter checkouts</span>
      </div>
    </div>
  );
}
