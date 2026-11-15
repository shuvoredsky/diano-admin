'use client';

import { useSearchParams } from 'next/navigation';
import { useTableQueryParams } from '@/lib/crud/use-table-query-params';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { BANNER_PLACEMENTS } from '../../constants/banners.constants';

export function BannersFilterBar() {
  const searchParams = useSearchParams();
  const { setFilter, resetFilters } = useTableQueryParams();

  const currentPlacement = searchParams.get('placement') || 'ALL';
  const currentStatus = searchParams.get('isActive') || 'ALL';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-2xs">
      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={currentPlacement}
          onChange={(e) => setFilter('placement', e.target.value === 'ALL' ? undefined : e.target.value)}
          aria-label="Filter by placement"
          className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">All Placements</option>
          {BANNER_PLACEMENTS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <select
          value={currentStatus}
          onChange={(e) => setFilter('isActive', e.target.value === 'ALL' ? undefined : e.target.value)}
          aria-label="Filter by status"
          className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => resetFilters()}
        className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset
      </Button>
    </div>
  );
}
