'use client';

import { X, Receipt, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { MoneyText } from '@/components/shared/money-text';
import { ErrorState } from '@/components/feedback/error-state';
import { useRefundDetailQuery } from '../hooks/use-refunds-queries';

export interface RefundDetailModalProps {
  refundId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RefundDetailModal({ refundId, isOpen, onClose }: RefundDetailModalProps) {
  const {
    data: refund,
    isLoading,
    isError,
    error,
    refetch,
  } = useRefundDetailQuery(refundId || undefined);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">
                Refund Record
              </h2>
              {refund && (
                <div className="text-[11px] text-muted-foreground font-mono">
                  ID: {refund.id}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 w-full rounded-xl bg-muted/40 animate-pulse" />
            <div className="h-28 w-full rounded-xl bg-muted/40 animate-pulse" />
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to load refund record"
            message={error instanceof Error ? error.message : 'Unknown error'}
            onRetry={() => refetch()}
          />
        ) : refund ? (
          <div className="space-y-4 text-xs">
            {/* Amount Banner */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground block">Refund Amount</span>
                <span className="text-xl font-bold text-foreground">
                  <MoneyText amount={refund.amount} />
                </span>
              </div>
              <StatusBadge status={refund.status} />
            </div>

            {/* Reason */}
            <div className="rounded-xl border border-border bg-card p-3 space-y-1">
              <span className="font-semibold text-foreground block">Reason for Refund</span>
              <p className="text-muted-foreground">&quot;{refund.reason}&quot;</p>
            </div>

            {/* Order and Customer Details */}
            <div className="rounded-xl border border-border bg-card p-3 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                <span>Order Information</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Order Number</span>
                  <Link
                    href={`/admin/orders?search=${refund.order?.orderNumber || refund.orderId}`}
                    className="font-bold text-primary hover:underline"
                  >
                    #{refund.order?.orderNumber || refund.orderId}
                  </Link>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Customer</span>
                  <span className="font-medium text-foreground">
                    {refund.order?.customer?.name || 'Customer'}
                  </span>
                </div>
              </div>
            </div>

            {/* Gateway & Settlement Reference */}
            <div className="rounded-xl border border-border bg-card p-3 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                <span>Gateway & Settlement Reference</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Provider</span>
                  <span className="font-medium text-foreground">
                    {refund.payment?.provider || 'Gateway'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Gateway Refund ID / Reference</span>
                  <span className="font-mono text-muted-foreground">
                    {refund.providerRefundId || 'Manual / Internal'}
                  </span>
                  <span className="block text-[10px] text-muted-foreground/80 italic mt-0.5">
                    {refund.providerRefundId?.startsWith('SSL-REF-') || refund.providerRefundId?.startsWith('REF-')
                      ? '(SSLCOMMERZ gateway transaction reference)'
                      : '(Manual ledger reference / offline settlement)'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Created At</span>
                  <span className="text-muted-foreground">
                    <DateText date={refund.createdAt} format="long" />
                  </span>
                </div>
                {refund.processedAt && (
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Disbursed At</span>
                    <span className="text-primary font-medium flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <DateText date={refund.processedAt} format="long" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

