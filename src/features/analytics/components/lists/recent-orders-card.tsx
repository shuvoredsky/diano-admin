'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { EmptyState } from '@/components/feedback/empty-state';
import { ShoppingBag, ArrowUpRight, AlertCircle, RefreshCw } from 'lucide-react';
import type { RecentOrderItem } from '../../types/analytics.types';

export interface RecentOrdersCardProps {
  orders?: RecentOrderItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function RecentOrdersCard({
  orders = [],
  loading = false,
  error = null,
  onRetry,
  className,
}: RecentOrdersCardProps) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-2xs ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-base tracking-tight">Recent Orders</h3>
          <p className="text-xs text-muted-foreground">Latest transactions across the store</p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-deep transition-colors"
        >
          <span>View all</span>
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
      ) : orders.length === 0 ? (
        <EmptyState
          title="No recent orders"
          description="New orders will show up here once placed."
          icon={<ShoppingBag className="h-8 w-8 text-muted-foreground/60" />}
        />
      ) : (
        <div className="divide-y divide-border/60">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium text-xs text-foreground hover:text-primary transition-colors block truncate"
                >
                  #{order.orderNumber}
                </Link>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                  <span className="truncate">{order.customerName || 'Walk-in / Guest'}</span>
                  <span>•</span>
                  <DateText date={order.placedAt} format="relative" />
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-3">
                <StatusBadge status={order.status} size="sm" />
                <MoneyText
                  amount={order.grandTotal}
                  size="sm"
                  className="font-semibold text-xs tabular-nums text-foreground"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

