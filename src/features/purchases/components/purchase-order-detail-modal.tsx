'use client';

import { useState } from 'react';
import { ShoppingCart, Send, XCircle, PackageCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import { Timeline, type TimelineEvent } from '@/components/shared/timeline';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useUpdatePurchaseOrderStatusMutation } from '../hooks/use-purchases-queries';
import type { PurchaseOrderEntity, PurchaseOrderStatus } from '../types/purchases.types';
import { PurchaseOrderReceiveModal } from './purchase-order-receive-modal';

export interface PurchaseOrderDetailModalProps {
  po: PurchaseOrderEntity;
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseOrderDetailModal({
  po,
  isOpen,
  onClose,
}: PurchaseOrderDetailModalProps) {
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [confirmStatusAction, setConfirmStatusAction] = useState<PurchaseOrderStatus | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const statusMutation = useUpdatePurchaseOrderStatusMutation(po.id);

  if (!isOpen) return null;

  const handleStatusTransition = async () => {
    if (!confirmStatusAction) return;
    setActionError(null);
    try {
      await statusMutation.mutateAsync(confirmStatusAction);
      setConfirmStatusAction(null);
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : `Failed to transition PO to ${confirmStatusAction}`
      );
    }
  };

  // Build timeline events
  const timelineEvents: TimelineEvent[] = [
    {
      id: 'created',
      title: 'Purchase Order Draft Created',
      description: `Initial draft created for vendor ${po.supplier?.name}`,
      timestamp: po.createdAt,
      status: 'DRAFT',
    },
  ];

  if (po.orderedAt) {
    timelineEvents.push({
      id: 'ordered',
      title: 'Submitted to Supplier (Ordered)',
      description: 'Order placed with vendor; awaiting warehouse inbound dispatch',
      timestamp: po.orderedAt,
      status: 'ORDERED',
    });
  }

  if (po.status === 'PARTIALLY_RECEIVED') {
    timelineEvents.push({
      id: 'partially_received',
      title: 'Partially Received',
      description: 'Partial shipment received and stock balances credited',
      timestamp: po.updatedAt,
      status: 'PARTIALLY_RECEIVED',
    });
  }

  if (po.receivedAt) {
    timelineEvents.push({
      id: 'received',
      title: 'Goods Fully Received',
      description: 'All line items received in warehouse and ledger updated',
      timestamp: po.receivedAt,
      status: 'RECEIVED',
    });
  }

  if (po.status === 'CANCELLED') {
    timelineEvents.push({
      id: 'cancelled',
      title: 'Purchase Order Cancelled',
      description: 'Order was voided and discontinued',
      timestamp: po.updatedAt,
      status: 'CANCELLED',
    });
  }

  const getStatusBadgeVariant = (st: PurchaseOrderStatus) => {
    switch (st) {
      case 'RECEIVED':
        return 'success';
      case 'PARTIALLY_RECEIVED':
      case 'ORDERED':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
        <div className="my-8 w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">PO #{po.poNumber}</h3>
                  <StatusBadge
                    status={po.status.replace(/_/g, ' ').toLowerCase()}
                    variant={getStatusBadgeVariant(po.status)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vendor: <strong className="text-foreground">{po.supplier?.name}</strong> (
                  {po.supplier?.code})
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                Total Order Value
              </span>
              <div className="text-lg font-black text-primary-deep dark:text-primary">
                <MoneyText amount={po.totalAmount} />
              </div>
            </div>
          </div>

          {actionError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-border bg-muted/20 p-3 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Created Date</span>
              <div className="font-semibold text-foreground mt-0.5">
                <DateText date={po.createdAt} format="date" />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Expected Delivery</span>
              <div className="font-semibold text-foreground mt-0.5">
                <DateText date={po.expectedDeliveryDate} format="date" fallback="Not specified" />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Warehouse</span>
              <div className="font-semibold text-foreground mt-0.5">
                {po.warehouse?.name || 'Main Warehouse'}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Items Count</span>
              <div className="font-semibold text-foreground mt-0.5">
                {po.items?.length || 0} line items
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Ordered Items
            </h4>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
                  <tr>
                    <th className="p-2.5">Variant SKU / Name</th>
                    <th className="p-2.5 text-center">Ordered</th>
                    <th className="p-2.5 text-center">Received</th>
                    <th className="p-2.5 text-right">Unit Cost</th>
                    <th className="p-2.5 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {po.items?.map(item => (
                    <tr key={item.id} className="hover:bg-muted/10">
                      <td className="p-2.5">
                        <span className="font-semibold text-foreground block truncate">
                          {item.variant?.name || 'Variant'}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {item.variant?.sku}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-foreground">
                        {item.orderedQuantity}
                      </td>
                      <td className="p-2.5 text-center font-medium text-emerald-600 dark:text-emerald-400">
                        {item.receivedQuantity}
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        <MoneyText amount={item.unitCost} />
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold text-foreground">
                        <MoneyText amount={item.lineTotal} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Lifecycle History
            </h4>
            <Timeline events={timelineEvents} />
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>

            <PermissionGate permissions={['supplier:manage']}>
              <div className="flex items-center gap-2">
                {/* State: DRAFT -> ORDERED */}
                {po.status === 'DRAFT' && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setConfirmStatusAction('ORDERED')}
                    disabled={statusMutation.isPending}
                    className="flex items-center gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit PO to Vendor</span>
                  </Button>
                )}

                {/* State: ORDERED or PARTIALLY_RECEIVED -> Receive Goods */}
                {(po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED') && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setReceiveModalOpen(true)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <PackageCheck className="h-4 w-4" />
                    <span>
                      {po.status === 'PARTIALLY_RECEIVED'
                        ? 'Receive Remaining Items'
                        : 'Receive Goods Inbound'}
                    </span>
                  </Button>
                )}

                {/* State: DRAFT, ORDERED, PARTIALLY_RECEIVED -> CANCELLED */}
                {(po.status === 'DRAFT' ||
                  po.status === 'ORDERED' ||
                  po.status === 'PARTIALLY_RECEIVED') && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setConfirmStatusAction('CANCELLED')}
                    disabled={statusMutation.isPending}
                    className="flex items-center gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel Purchase Order</span>
                  </Button>
                )}
              </div>
            </PermissionGate>
          </div>
        </div>
      </div>

      {receiveModalOpen && (
        <PurchaseOrderReceiveModal
          po={po}
          isOpen={receiveModalOpen}
          onClose={() => {
            setReceiveModalOpen(false);
            onClose();
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirmStatusAction)}
        onOpenChange={open => !open && setConfirmStatusAction(null)}
        title={
          confirmStatusAction === 'ORDERED'
            ? 'Submit Purchase Order to Supplier'
            : 'Cancel Purchase Order'
        }
        description={
          confirmStatusAction === 'ORDERED'
            ? `Submit PO #${po.poNumber} to ${po.supplier?.name}? This transitions the order status to ORDERED.`
            : `Are you sure you want to cancel PO #${po.poNumber}? This is a terminal state and cannot be undone.`
        }
        confirmLabel={confirmStatusAction === 'ORDERED' ? 'Mark as Ordered' : 'Cancel PO'}
        variant={confirmStatusAction === 'CANCELLED' ? 'destructive' : 'primary'}
        isLoading={statusMutation.isPending}
        onConfirm={handleStatusTransition}
      />
    </>
  );
}

