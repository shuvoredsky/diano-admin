'use client';

import { Eye, Receipt } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { MoneyText } from '@/components/shared/money-text';
import { EmptyState } from '@/components/feedback/empty-state';
import type { RefundEntity } from '../types/refunds.types';

export interface RefundsTableProps {
  refunds: RefundEntity[];
  isLoading: boolean;
  onViewDetail: (refund: RefundEntity) => void;
}

export function RefundsTable({ refunds, isLoading, onViewDetail }: RefundsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (refunds.length === 0) {
    return (
      <EmptyState
        title="No Refund Records Found"
        description="All authorized and disbursed customer refunds will appear here. You can inspect settlement details and gateway transaction receipts."
        icon={<Receipt className="h-8 w-8 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Refund ID / Date</th>
              <th className="px-4 py-3">Order Number</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {refunds.map((refund) => (
              <tr key={refund.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-xs text-foreground block font-mono">
                      {refund.id.slice(0, 12)}...
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      <DateText date={refund.createdAt} />
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders?search=${refund.order?.orderNumber || refund.orderId}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    #{refund.order?.orderNumber || refund.orderId}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground block">
                    {refund.order?.customer?.name || 'Customer'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-foreground">
                  <MoneyText amount={refund.amount} />
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                  {refund.reason}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={refund.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(refund)}
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

