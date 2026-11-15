'use client';

import { useTransition } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTableQueryParams } from '@/lib/crud';
import { REVIEW_STATUS_OPTIONS, RATING_FILTER_OPTIONS } from '../constants/reviews.constants';

export function ReviewsFilterBar() {
  const [, startTransition] = useTransition();
  const { searchParams, setFilter, resetFilters } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const rating = searchParams.get('rating') || '';

  const hasActiveFilters = Boolean(search || status || rating);

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

  const handleRatingChange = (value: string) => {
    startTransition(() => {
      setFilter('rating', value || null);
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reviews by comment or user..."
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

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            aria-label="Filter by review status"
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden cursor-pointer"
          >
            <option value="">All Statuses</option>
            {REVIEW_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={rating}
            onChange={(e) => handleRatingChange(e.target.value)}
            aria-label="Filter by rating"
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden cursor-pointer"
          >
            {RATING_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetFilters()}
            className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Filter className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}
