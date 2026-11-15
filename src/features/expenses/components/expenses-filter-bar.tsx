'use client';

import { useTransition } from 'react';
import { Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTableQueryParams } from '@/lib/crud';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from '../constants/expenses.constants';

export function ExpensesFilterBar() {
  const [, startTransition] = useTransition();
  const { searchParams, setFilter, resetFilters } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const category = searchParams.get('category') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  const hasActiveFilters = Boolean(category || from || to);

  const handleCategoryChange = (value: string) => {
    startTransition(() => {
      setFilter('category', value || null);
    });
  };

  const handleFromChange = (value: string) => {
    startTransition(() => {
      setFilter('from', value || null);
    });
  };

  const handleToChange = (value: string) => {
    startTransition(() => {
      setFilter('to', value || null);
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            aria-label="Filter by expense category"
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden cursor-pointer"
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {EXPENSE_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex items-center gap-1">
            <Label htmlFor="expense-from" className="text-[11px] text-muted-foreground">
              From:
            </Label>
            <Input
              id="expense-from"
              type="date"
              value={from}
              onChange={(e) => handleFromChange(e.target.value)}
              aria-label="Filter from date (Dhaka)"
              className="h-8 text-xs w-36"
            />
          </div>
          <div className="flex items-center gap-1">
            <Label htmlFor="expense-to" className="text-[11px] text-muted-foreground">
              To:
            </Label>
            <Input
              id="expense-to"
              type="date"
              value={to}
              onChange={(e) => handleToChange(e.target.value)}
              aria-label="Filter to date (Dhaka)"
              className="h-8 text-xs w-36"
            />
          </div>
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
