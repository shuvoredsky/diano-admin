'use client';

import Link from 'next/link';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { EmptyState } from '@/components/feedback/empty-state';
import { AlertTriangle, ArrowUpRight, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { LowStockItem } from '../../types/analytics.types';

export interface LowStockCardProps {
  items?: LowStockItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function LowStockCard({
  items = [],
  loading = false,
  error = null,
  onRetry,
  className,
}: LowStockCardProps) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-2xs ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-base tracking-tight">Low Stock Alerts</h3>
          <p className="text-xs text-muted-foreground">Variants approaching reorder point</p>
        </div>
        <Link
          href="/admin/inventory"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-deep transition-colors"
        >
          <span>Inventory</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-destructive rounded-xl border border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-5 w-5 mb-1" />
          <p>{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          )}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="All stock levels healthy"
          description="No variants are currently below their minimum threshold."
          icon={<CheckCircle2 className="h-8 w-8 text-primary" />}
        />
      ) : (
        <div className="divide-y divide-border/60">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs text-foreground truncate">{item.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                  <span className="font-mono">{item.sku}</span>
                  <span>•</span>
                  <span>Min: {item.lowStockThreshold}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>{item.available} avail</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

