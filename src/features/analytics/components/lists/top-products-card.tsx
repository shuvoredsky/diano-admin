'use client';

import Link from 'next/link';
import { MoneyText } from '@/components/shared/money-text';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { EmptyState } from '@/components/feedback/empty-state';
import { Trophy, ArrowUpRight, AlertCircle, RefreshCw } from 'lucide-react';
import type { TopProductItem } from '../../types/analytics.types';

export interface TopProductsCardProps {
  products?: TopProductItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function TopProductsCard({
  products = [],
  loading = false,
  error = null,
  onRetry,
  className,
}: TopProductsCardProps) {
  // Top 5 products
  const displayProducts = products.slice(0, 5);

  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-2xs ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-base tracking-tight">Top Selling Products</h3>
          <p className="text-xs text-muted-foreground">Best performers by volume and revenue</p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-deep transition-colors"
        >
          <span>Catalog</span>
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
      ) : displayProducts.length === 0 ? (
        <EmptyState
          title="No product sales data"
          description="Performance will appear once items are purchased."
          icon={<Trophy className="h-8 w-8 text-muted-foreground/60" />}
        />
      ) : (
        <div className="divide-y divide-border/60">
          {displayProducts.map((prod, idx) => (
            <div
              key={`${prod.productId}-${prod.sku || idx}`}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs text-foreground truncate">{prod.productName}</p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">{prod.sku}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-foreground tabular-nums">
                  {prod.quantitySold} sold
                </p>
                <MoneyText
                  amount={prod.revenue}
                  size="xs"
                  className="text-muted-foreground tabular-nums"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

