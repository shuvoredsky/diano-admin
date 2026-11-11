'use client';

import type { ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/feedback/skeletons';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: ReactNode;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  total?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  syncWithUrl?: boolean;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  total = 0,
  page: propPage,
  limit: propLimit,
  sortBy: propSortBy,
  sortOrder: propSortOrder,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  emptyAction,
  onPageChange,
  onLimitChange,
  onSortChange,
  syncWithUrl = true,
  className,
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL fallback resolution
  const page =
    propPage ??
    (syncWithUrl ? Number(searchParams?.get('page') || '1') : 1);
  const limit =
    propLimit ??
    (syncWithUrl ? Number(searchParams?.get('limit') || '10') : 10);
  const sortBy =
    propSortBy ??
    (syncWithUrl ? searchParams?.get('sortBy') || undefined : undefined);
  const sortOrder =
    propSortOrder ??
    (syncWithUrl
      ? (searchParams?.get('sortOrder') as 'asc' | 'desc') || 'desc'
      : 'desc');

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(total, page * limit);

  const updateUrlParam = (updates: Record<string, string | null>) => {
    if (!syncWithUrl) return;
    const params = new URLSearchParams(searchParams?.toString() || '');
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageClick = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (onPageChange) {
      onPageChange(newPage);
    }
    updateUrlParam({ page: String(newPage) });
  };

  const handleLimitClick = (newLimit: number) => {
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
    updateUrlParam({ limit: String(newLimit), page: '1' });
  };

  const handleSortClick = (columnKey: string) => {
    let newOrder: 'asc' | 'desc' = 'asc';
    if (sortBy === columnKey) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    if (onSortChange) {
      onSortChange(columnKey, newOrder);
    }
    updateUrlParam({ sortBy: columnKey, sortOrder: newOrder, page: '1' });
  };

  return (
    <div className={cn('w-full rounded-2xl border border-border bg-card shadow-2xs overflow-hidden', className)}>
      {/* Responsive Table Wrapper */}
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map(col => {
                const isCurrentSort = sortBy === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.className
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSortClick(col.key)}
                        className="inline-flex items-center gap-1.5 hover:text-foreground font-semibold uppercase tracking-wider transition-colors select-none"
                      >
                        <span>{col.header}</span>
                        {isCurrentSort ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              Array.from({ length: limit > 10 ? 10 : limit }).map((_, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/10">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-mint/10 dark:hover:bg-muted/30 transition-colors"
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3.5 text-foreground align-middle text-sm',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(row, rIdx)
                        : (row[col.key] as ReactNode) ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border px-4 py-3 bg-card text-xs text-muted-foreground">
        {/* Total indicator & Page size select */}
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="font-semibold text-foreground">{startItem}</strong> to{' '}
            <strong className="font-semibold text-foreground">{endItem}</strong> of{' '}
            <strong className="font-semibold text-foreground">{total}</strong> results
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            <span>Rows:</span>
            <select
              value={limit}
              onChange={e => handleLimitClick(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              {[10, 25, 50, 100].map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handlePageClick(1)}
            disabled={page <= 1 || isLoading}
            className="h-8 w-8 rounded-lg"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handlePageClick(page - 1)}
            disabled={page <= 1 || isLoading}
            className="h-8 w-8 rounded-lg"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="px-2 font-medium text-foreground">
            Page {page} of {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handlePageClick(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="h-8 w-8 rounded-lg"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handlePageClick(totalPages)}
            disabled={page >= totalPages || isLoading}
            className="h-8 w-8 rounded-lg"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
