'use client';

import { useState } from 'react';
import { useAdminOrderByIdQuery } from '../hooks/use-orders-queries';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/feedback/skeletons';
import { ErrorState } from '@/components/feedback/error-state';
import { ORDER_STATUS_VARIANTS, ORDER_STATUS_LABELS } from '../constants/orders.constants';
import { downloadAdminOrderInvoiceBlob, saveBlobAsFile } from '../api/orders.api';
import { X, Download, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { OrderDetailCards } from './order-detail-cards';
import { OrderItemsTable } from './order-items-table';
import { OrderNotesSection } from './order-notes-section';
import { OrderTimelineSection } from './order-timeline-section';
import { OrderStatusActions } from './order-status-actions';

export interface OrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, isOpen, onClose }: OrderDetailModalProps) {
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminOrderByIdQuery(isOpen && orderId ? orderId : undefined);

  if (!isOpen) return null;

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setIsDownloadingInvoice(true);
    setTransitionError(null);
    try {
      const { blob, filename } = await downloadAdminOrderInvoiceBlob(order.id, order.orderNumber);
      saveBlobAsFile(blob, filename);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to download invoice PDF';
      setTransitionError(msg);
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-foreground">
                  {order ? `Order #${order.orderNumber}` : 'Order Details'}
                </h2>
                {order && (
                  <StatusBadge
                    status={ORDER_STATUS_LABELS[order.status] || order.status}
                    variant={ORDER_STATUS_VARIANTS[order.status] || 'neutral'}
                  />
                )}
              </div>
              {order?.placedAt && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <span>Placed on</span>
                  <DateText date={order.placedAt} />
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-semibold"
                disabled={isDownloadingInvoice}
                onClick={handleDownloadInvoice}
              >
                {isDownloadingInvoice ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Invoice PDF
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : isError ? (
            <ErrorState
              title="Unable to load order details"
              message={error instanceof Error ? error.message : 'An error occurred fetching order data.'}
              onRetry={() => refetch()}
            />
          ) : order ? (
            <>
              {/* Transition / Download Error Banner */}
              {transitionError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{transitionError}</span>
                </div>
              )}

              {/* Customer, Shipping, Payment, Logistics Cards */}
              <OrderDetailCards order={order} />

              {/* Order Items Table & Financial Summary */}
              <OrderItemsTable order={order} />

              {/* Admin & Customer Notes Section */}
              <OrderNotesSection order={order} onNoteAdded={() => refetch()} />

              {/* Order Lifecycle Timeline */}
              <OrderTimelineSection order={order} />
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {order && (
            <OrderStatusActions
              order={order}
              onStatusUpdated={() => refetch()}
              onError={(msg) => setTransitionError(msg)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
