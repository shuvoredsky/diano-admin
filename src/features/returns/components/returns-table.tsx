'use client';

import { Eye, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { MoneyText } from '@/components/shared/money-text';
import { EmptyState } from '@/components/feedback/empty-state';
import type { ReturnRequestEntity } from '../types/returns.types';

export interface ReturnsTableProps {
  returns: ReturnRequestEntity[];
  isLoading: boolean;
  onViewDetail: (ret: ReturnRequestEntity) => void;
}

export function ReturnsTable({ returns, isLoading, onViewDetail }: ReturnsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <EmptyState
        title="No Return Requests Found"
        description="Customer return and RMA requests will appear here once submitted. You can approve, inspect, and process refunds."
        icon={<RotateCcw className="h-8 w-8 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Return #</th>
              <th className="px-4 py-3">Order Number</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3 text-center">Items</th>
              <th className="px-4 py-3 text-right">Refund Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {returns.map((ret) => (
              <tr key={ret.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-xs text-foreground block font-mono">
                      #{ret.returnNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      <DateText date={ret.requestedAt} />
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders?search=${ret.order?.orderNumber || ret.orderId}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    #{ret.order?.orderNumber || ret.orderId}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <span className="font-medium text-foreground block">
                      {ret.customer?.name || 'Customer'}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {ret.customer?.phone || ret.customer?.email || '—'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="rounded bg-muted px-2 py-0.5 font-bold font-mono text-[11px] text-foreground">
                    {ret.items?.length || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  {ret.refundAmount ? (
                    <MoneyText amount={ret.refundAmount} />
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={ret.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(ret)}
                    className="h-8 gap-1.5 text-xs cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
