'use client';

import { X, RotateCcw, Package, User, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { MoneyText } from '@/components/shared/money-text';
import { ErrorState } from '@/components/feedback/error-state';
import { useReturnDetailQuery } from '../hooks/use-returns-queries';
import { ReturnActionsSection } from './return-actions-section';

export interface ReturnDetailModalProps {
  returnId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReturnDetailModal({
  returnId,
  isOpen,
  onClose,
  onSuccess,
}: ReturnDetailModalProps) {
  const {
    data: returnRequest,
    isLoading,
    isError,
    error,
    refetch,
  } = useReturnDetailQuery(returnId || undefined);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">
                Return Request #{returnRequest?.returnNumber || returnId}
              </h2>
              {returnRequest && (
                <div className="text-[11px] text-muted-foreground">
                  Requested <DateText date={returnRequest.requestedAt} format="long" />
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
          <div className="space-y-4">
            <div className="h-20 w-full rounded-xl bg-muted/40 animate-pulse" />
            <div className="h-40 w-full rounded-xl bg-muted/40 animate-pulse" />
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to load return request"
            message={error instanceof Error ? error.message : 'Unknown error'}
            onRetry={() => refetch()}
          />
        ) : returnRequest ? (
          <div className="space-y-4 text-xs">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Order Info */}
              <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                  <span>Associated Order</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order Number:</span>
                  <Link
                    href={`/admin/orders?search=${returnRequest.order?.orderNumber || returnRequest.orderId}`}
                    className="font-bold text-primary hover:underline"
                  >
                    #{returnRequest.order?.orderNumber || returnRequest.orderId}
                  </Link>
                </div>
                {returnRequest.order?.status && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Order Status:</span>
                    <span className="font-medium text-foreground">{returnRequest.order.status}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Return Status:</span>
                  <StatusBadge status={returnRequest.status} />
                </div>
              </div>

              {/* Customer Info */}
              <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>Customer Details</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-semibold text-foreground">
                    {returnRequest.customer?.name || 'Customer'}
                  </span>
                </div>
                {returnRequest.customer?.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-muted-foreground">{returnRequest.customer.email}</span>
                  </div>
                )}
                {returnRequest.customer?.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-mono text-muted-foreground">{returnRequest.customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Reason / Notes */}
            {(returnRequest.customerNote || returnRequest.reason) && (
              <div className="rounded-xl border border-border bg-card p-3 space-y-1">
                <span className="font-semibold text-foreground block">Customer Reason & Notes</span>
                {returnRequest.reason && (
                  <p className="font-medium text-foreground">
                    Reason: {returnRequest.reason.reason} ({returnRequest.reason.code})
                  </p>
                )}
                {returnRequest.customerNote && (
                  <p className="text-muted-foreground italic">&quot;{returnRequest.customerNote}&quot;</p>
                )}
              </div>
            )}

            {/* Return Items List */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Package className="h-4 w-4 text-primary" />
                <span>Return Line Items ({returnRequest.items?.length || 0})</span>
              </div>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Line Total</th>
                      <th className="px-3 py-2">Inspection Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(returnRequest.items || []).map((it) => (
                      <tr key={it.id}>
                        <td className="px-3 py-2">
                          <span className="font-semibold text-foreground block">
                            {it.orderItem?.productName || 'Order Item'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {it.orderItem?.variantName} · SKU: {it.orderItem?.sku}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center font-bold font-mono">
                          {it.quantity}
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground">
                          {it.orderItem?.unitPrice ? (
                            <MoneyText amount={it.orderItem.unitPrice} />
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-foreground">
                          {it.orderItem?.lineTotal ? (
                            <MoneyText amount={it.orderItem.lineTotal} />
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {it.condition || it.action ? (
                            <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                              {it.condition || '—'} / {it.action || '—'}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60 text-[11px]">Pending Inspection</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions Section */}
            <ReturnActionsSection
              returnRequest={returnRequest}
              onSuccess={() => {
                refetch();
                onSuccess?.();
              }}
            />
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
