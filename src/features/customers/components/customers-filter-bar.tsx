'use client';

import { useTransition } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTableQueryParams } from '@/lib/crud';
import { CUSTOMER_STATUS_LABELS } from '../constants/customers.constants';
import type { CustomerStatus } from '../types/customers.types';

export function CustomersFilterBar() {
  const [, startTransition] = useTransition();
  const { searchParams, setFilter, resetFilters } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const hasActiveFilters = Boolean(search || status);

  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setFilter('search', value ? value.trim() : null);
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
        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Customer Status Select */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          aria-label="Filter by customer status"
          className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
        >
          <option value="">All Statuses</option>
          {(['ACTIVE', 'SUSPENDED', 'INACTIVE', 'PENDING_VERIFICATION'] as CustomerStatus[]).map((st) => (
            <option key={st} value={st}>
              {CUSTOMER_STATUS_LABELS[st] || st}
            </option>
          ))}
        </select>

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
        <span>Filter customers</span>
      </div>
    </div>
  );
}
