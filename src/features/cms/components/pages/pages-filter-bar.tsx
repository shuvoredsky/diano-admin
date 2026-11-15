'use client';

import { useSearchParams } from 'next/navigation';
import { useTableQueryParams } from '@/lib/crud/use-table-query-params';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw, Search } from 'lucide-react';
import { PAGE_TYPES } from '../../constants/pages.constants';

export function PagesFilterBar() {
  const searchParams = useSearchParams();
  const { setFilter, setSearch, resetFilters, search } = useTableQueryParams();

  const currentType = searchParams.get('type') || 'ALL';
  const currentStatus = searchParams.get('status') || 'ALL';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-2xs">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages by title or slug..."
            className="h-9 pl-9 text-xs"
          />
        </div>

        <select
          value={currentType}
          onChange={(e) => setFilter('type', e.target.value === 'ALL' ? undefined : e.target.value)}
          aria-label="Filter by page type"
          className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">All Types</option>
          {PAGE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={currentStatus}
          onChange={(e) => setFilter('status', e.target.value === 'ALL' ? undefined : e.target.value)}
          aria-label="Filter by page status"
          className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
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
