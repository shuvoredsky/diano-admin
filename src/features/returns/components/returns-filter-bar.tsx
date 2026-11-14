'use client';

import { useTransition } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTableQueryParams } from '@/lib/crud';
import { RETURN_STATUS_LABELS } from '../constants/returns.constants';
import type { ReturnStatus } from '../types/returns.types';

export function ReturnsFilterBar() {
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
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by return #, order #..."
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

        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          aria-label="Filter by return status"
          className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
        >
          <option value="">All Return Statuses</option>
          {(Object.keys(RETURN_STATUS_LABELS) as ReturnStatus[]).map((st) => (
            <option key={st} value={st}>
              {RETURN_STATUS_LABELS[st]}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => resetFilters()}
            className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        <span>Live Return Filters</span>
      </div>
    </div>
  );
}

