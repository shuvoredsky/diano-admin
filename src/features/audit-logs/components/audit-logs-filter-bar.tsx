'use client';

import { Search, RotateCcw, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AuditLogFilterParams } from '../types/audit-logs.types';

export interface AuditLogsFilterBarProps {
  filters: AuditLogFilterParams;
  onFilterChange: (updates: Partial<AuditLogFilterParams>) => void;
  onReset: () => void;
}

export function AuditLogsFilterBar({
  filters,
  onFilterChange,
  onReset,
}: AuditLogsFilterBarProps) {
  const hasActiveFilters = Boolean(
    filters.actor ||
      filters.action ||
      filters.targetType ||
      filters.from ||
      filters.to
  );

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-4 shadow-2xs backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Actor Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by actor name or email..."
            value={filters.actor ?? ''}
            onChange={(e) => onFilterChange({ actor: e.target.value || undefined, page: 1 })}
            className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Action Filter */}
        <div className="relative w-44">
          <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter action (e.g. login)..."
            value={filters.action ?? ''}
            onChange={(e) => onFilterChange({ action: e.target.value || undefined, page: 1 })}
            className="h-9 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Target Type Filter */}
        <div className="w-40">
          <input
            type="text"
            placeholder="Target (e.g. Order, User)..."
            value={filters.targetType ?? ''}
            onChange={(e) => onFilterChange({ targetType: e.target.value || undefined, page: 1 })}
            className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Date From */}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="date"
            aria-label="Filter from date"
            value={filters.from ?? ''}
            onChange={(e) => onFilterChange({ from: e.target.value || undefined, page: 1 })}
            className="h-9 rounded-xl border border-input bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            aria-label="Filter to date"
            value={filters.to ?? ''}
            onChange={(e) => onFilterChange({ to: e.target.value || undefined, page: 1 })}
            className="h-9 rounded-xl border border-input bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 gap-1.5 rounded-xl px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
