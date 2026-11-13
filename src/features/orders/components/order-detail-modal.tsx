'use client';

import { useState } from 'react';
import {
  X,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileDown,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import { Timeline, type TimelineEvent } from '@/components/shared/timeline';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { ErrorState } from '@/components/feedback/error-state';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { PermissionGate } from '@/components/shared/permission-gate';
import {
  useAdminOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useAddOrderNoteMutation,
} from '../hooks/use-orders-queries';
import { downloadAdminOrderInvoiceBlob, saveBlobAsFile } from '../api/orders.api';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
  PAYMENT_STATUS_VARIANTS,
  SHIPMENT_STATUS_VARIANTS,
  ORDER_TRANSITION_TABLE,
  getRequiredPermissionForTransition,
} from '../constants/orders.constants';
import type { OrderStatus } from '../types/orders.types';

export interface OrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, isOpen, onClose }: OrderDetailModalProps) {
  const [pendingTransition, setPendingTransition] = useState<OrderStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isCustomerVisible, setIsCustomerVisible] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useAdminOrderByIdQuery(orderId || undefined);

  const updateStatusMutation = useUpdateOrderStatusMutation();
  const addNoteMutation = useAddOrderNoteMutation();

  if (!isOpen || !orderId) return null;

  const handleInitiateTransition = (targetStatus: OrderStatus) => {
    setTransitionError(null);
    setFormError(null);
    setStatusNote('');
    setPendingTransition(targetStatus);
  };

  const handleConfirmTransition = async () => {
    if (!order || !pendingTransition) return;
    if (pendingTransition === 'CANCELLED' && !statusNote.trim()) {
      setFormError('A cancellation reason is required.');
      throw new Error('A cancellation reason is required.');
    }
    setFormError(null);
    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        input: {
          status: pendingTransition,
          note: statusNote.trim() || undefined,
        },
      });
      setPendingTransition(null);
      setStatusNote('');
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update order status';
      setTransitionError(msg);
    }
  };

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

  const handleAddNote = async () => {
    if (!order || !newNote.trim()) return;
    setNoteError(null);
    try {
      await addNoteMutation.mutateAsync({
        id: order.id,
        input: {
          note: newNote.trim(),
          isCustomerVisible,
        },
      });
      setNewNote('');
      setIsCustomerVisible(false);
      refetch();
    } catch (err: unknown) {
      setNoteError(err instanceof Error ? err.message : 'Failed to add order note');
    }
  };

  const nextTransitions = order ? ORDER_TRANSITION_TABLE[order.status] || [] : [];

  // Build timeline events from statusHistory
  const timelineEvents: TimelineEvent[] = (order?.statusHistory || []).map((hist, idx) => ({
    id: hist.id || `history-${idx}`,
    title: `Order Status: ${ORDER_STATUS_LABELS[hist.status] || hist.status}`,
    description: hist.note || (idx === 0 ? 'Order status recorded in system' : undefined),
    timestamp: hist.createdAt,
    status: hist.status,
    actor: hist.changedById ? `Staff (${hist.changedById.slice(0, 8)})` : undefined,
    icon:
      hist.status === 'CANCELLED' ? (
        <AlertCircle className="h-4 w-4 text-destructive" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-primary" />
      ),
  }));

  // If statusHistory is empty but order has placedAt, fallback to placed event
  if (timelineEvents.length === 0 && order?.placedAt) {
    timelineEvents.push({
      id: 'placed',
      title: 'Order Placed',
      description: `Customer completed checkout for Order #${order.orderNumber}`,
      timestamp: order.placedAt,
      status: order.status,
      icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  Order #{order?.orderNumber || orderId}
                </h2>
                {order && (
                  <StatusBadge
                    status={ORDER_STATUS_LABELS[order.status] || order.status}
                    variant={ORDER_STATUS_VARIANTS[order.status] || 'neutral'}
                  />
                )}
              </div>
              {order?.placedAt && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Placed on <DateText date={order.placedAt} />
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {order && (
              <>
                <PermissionGate permissions={['order:read']}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDownloadingInvoice}
                    onClick={handleDownloadInvoice}
                    className="gap-1.5"
                  >
                    {isDownloadingInvoice ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <FileDown className="h-4 w-4 text-primary" />
                    )}
                    <span>{isDownloadingInvoice ? 'Downloading...' : 'Invoice PDF'}</span>
                  </Button>
                </PermissionGate>

                <div className="text-right pl-2 border-l border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Grand Total
                  </span>
                  <div className="text-base font-black text-primary-deep dark:text-primary">
                    <MoneyText amount={order.grandTotal} />
                  </div>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {transitionError && (
            <div className="flex items-center justify-between rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-medium">{transitionError}</span>
              </div>
              <button
                type="button"
                onClick={() => setTransitionError(null)}
                className="p-1 hover:bg-destructive/10 rounded transition-colors"
                aria-label="Dismiss error"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {isLoading ? (
            <TableSkeleton rows={8} columns={4} />
          ) : error ? (
            <ErrorState
              title="Failed to load order details"
              message={error instanceof Error ? error.message : 'Unknown error occurred'}
              onRetry={() => refetch()}
            />
          ) : order ? (
            <>
              {/* Order Info Cards: Customer, Shipping, Payment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Customer Details */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <User className="h-4 w-4 text-primary" />
                    Customer Details
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-foreground">
                      {order.customerSnapshot?.name || 'Anonymous Customer'}
                    </div>
                    <div className="font-mono text-muted-foreground">
                      {order.customerSnapshot?.phone || 'No phone'}
                    </div>
                    {order.customerSnapshot?.email && (
                      <div className="text-muted-foreground truncate">
                        {order.customerSnapshot.email}
                      </div>
                    )}
                    <div className="pt-1">
                      <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">
                        {order.customerSnapshot?.isGuest ? 'Guest Checkout' : 'Registered Customer'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Destination */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    Delivery Destination
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-foreground">
                      {order.customerSnapshot?.name}
                    </div>
                    {order.customerSnapshot?.phone && (
                      <div className="font-mono text-muted-foreground">
                        {order.customerSnapshot.phone}
                      </div>
                    )}
                    <div className="text-muted-foreground">
                      {order.shippingAddressSnapshot?.address}
                    </div>
                    <div className="text-muted-foreground font-medium">
                      {[
                        order.shippingAddressSnapshot?.area,
                        order.shippingAddressSnapshot?.zoneName,
                        order.shippingAddressSnapshot?.district,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </div>
                </div>

                {/* Payment Overview */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Payment Details
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="font-semibold text-foreground uppercase">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <StatusBadge
                        status={order.paymentStatus}
                        variant={PAYMENT_STATUS_VARIANTS[order.paymentStatus] || 'neutral'}
                      />
                    </div>
                    {order.payments && order.payments.length > 0 && order.payments[0] && (
                      <div className="pt-1 border-t border-border/60 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Trx ID:</span>
                          <span className="font-mono text-foreground font-semibold">
                            {order.payments[0].transactionId || 'N/A'}
                          </span>
                        </div>
                        {order.payments[0].paidAt && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Paid At:</span>
                            <DateText date={order.payments[0].paidAt} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Order Items ({order.items?.length || 0})
                  </h3>
                </div>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
                      <tr>
                        <th className="p-3">Product / SKU</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Discount</th>
                        <th className="p-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {order.items?.map((item, idx) => (
                        <tr key={item.id || `item-${idx}`} className="hover:bg-muted/10">
                          <td className="p-3">
                            <span className="font-semibold text-foreground block">
                              {item.productName}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {item.variantName} &bull;{' '}
                              <span className="font-mono">{item.sku}</span>
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-muted-foreground">
                            <MoneyText amount={item.unitPrice} />
                          </td>
                          <td className="p-3 text-center font-bold text-foreground">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-right font-mono text-muted-foreground">
                            <MoneyText amount={item.discount} />
                          </td>
                          <td className="p-3 text-right font-mono font-semibold text-foreground">
                            <MoneyText amount={item.lineTotal} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-full sm:w-72 space-y-1.5 rounded-xl border border-border bg-muted/20 p-4 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-mono">
                        <MoneyText amount={order.subtotal} />
                      </span>
                    </div>
                    {Number(order.discountTotal) > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Discount Total</span>
                        <span className="font-mono">
                          -<MoneyText amount={order.discountTotal} />
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping Fee</span>
                      <span className="font-mono">
                        <MoneyText amount={order.shippingTotal} />
                      </span>
                    </div>
                    {Number(order.taxTotal) > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tax / VAT</span>
                        <span className="font-mono">
                          <MoneyText amount={order.taxTotal} />
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-foreground">
                      <span>Grand Total</span>
                      <span className="font-black text-primary-deep dark:text-primary">
                        <MoneyText amount={order.grandTotal} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipments Section (if available) */}
              {order.shipments && order.shipments.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    Shipment & Logistics
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.shipments.map((shipment) => (
                      <div
                        key={shipment.id}
                        className="rounded-xl border border-border bg-muted/10 p-3 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            {shipment.courierName}
                          </span>
                          <StatusBadge
                            status={shipment.status}
                            variant={SHIPMENT_STATUS_VARIANTS[shipment.status] || 'neutral'}
                          />
                        </div>
                        {shipment.trackingNumber && (
                          <div className="text-[11px] text-muted-foreground">
                            Tracking: <span className="font-mono font-bold text-foreground">{shipment.trackingNumber}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-muted-foreground">
                          Updated: <DateText date={shipment.updatedAt} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin & Customer Notes Section */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Order Notes ({order.orderNotes?.length || 0})
                  </div>
                </div>

                {order.orderNotes && order.orderNotes.length > 0 ? (
                  <div className="space-y-2">
                    {order.orderNotes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-border bg-muted/15 p-3 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {note.authorId ? `Staff (${note.authorId.slice(0, 8)})` : 'Staff'}
                            </span>
                            <span
                              className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                                note.isCustomerVisible
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {note.isCustomerVisible ? 'Customer Visible' : 'Internal Note'}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            <DateText date={note.createdAt} />
                          </span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{note.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    No notes recorded for this order yet.
                  </div>
                )}

                <PermissionGate permissions={['order:update_status', 'order:manage']}>
                  <div className="rounded-xl border border-border bg-card p-3 space-y-2.5">
                    <h4 className="text-xs font-semibold text-foreground">Add Order Note</h4>
                    <textarea
                      value={newNote}
                      onChange={(e) => {
                        setNewNote(e.target.value);
                        if (noteError) setNoteError(null);
                      }}
                      placeholder="Type order progress update, audit detail, or customer instruction..."
                      className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                      rows={2}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isCustomerVisible}
                          onChange={(e) => setIsCustomerVisible(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span>Visible to customer</span>
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        disabled={addNoteMutation.isPending || !newNote.trim()}
                        onClick={handleAddNote}
                      >
                        {addNoteMutation.isPending ? 'Adding Note...' : 'Add Note'}
                      </Button>
                    </div>
                    {noteError && (
                      <p className="text-[11px] text-destructive font-medium">{noteError}</p>
                    )}
                  </div>
                </PermissionGate>
              </div>

              {/* Order Lifecycle Timeline */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Order Lifecycle History
                </div>
                <Timeline events={timelineEvents} />
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {order && (
            <div className="flex flex-wrap items-center gap-2">
              {nextTransitions.map((targetStatus) => {
                const isCancel = targetStatus === 'CANCELLED';
                const isSecondary = targetStatus === 'RETURNED' || targetStatus === 'REFUNDED';
                const btnVariant = isCancel ? 'destructive' : isSecondary ? 'outline' : 'default';
                const requiredPermission = getRequiredPermissionForTransition(targetStatus);

                return (
                  <PermissionGate
                    key={targetStatus}
                    permissions={[requiredPermission, 'order:manage']}
                  >
                    <Button
                      type="button"
                      variant={btnVariant}
                      size="sm"
                      disabled={updateStatusMutation.isPending}
                      onClick={() => handleInitiateTransition(targetStatus)}
                    >
                      {targetStatus === 'CONFIRMED'
                        ? 'Confirm Order'
                        : targetStatus === 'PROCESSING'
                        ? 'Process Order'
                        : targetStatus === 'PACKED'
                        ? 'Mark Packed'
                        : targetStatus === 'SHIPPED'
                        ? 'Dispatch / Ship'
                        : targetStatus === 'DELIVERED'
                        ? 'Mark Delivered'
                        : targetStatus === 'CANCELLED'
                        ? 'Cancel Order'
                        : targetStatus === 'RETURNED'
                        ? 'Mark Returned'
                        : targetStatus === 'REFUNDED'
                        ? 'Mark Refunded'
                        : `Mark ${ORDER_STATUS_LABELS[targetStatus] || targetStatus}`}
                    </Button>
                  </PermissionGate>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* State Transition Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pendingTransition)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingTransition(null);
            setStatusNote('');
            setFormError(null);
          }
        }}
        title={`Transition Order #${order?.orderNumber || ''} to ${
          pendingTransition ? ORDER_STATUS_LABELS[pendingTransition] : ''
        }`}
        description={
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              {pendingTransition === 'CANCELLED'
                ? 'Are you sure you want to cancel this order? This will release reserved inventory back to warehouse stock and notify the customer. This action cannot be undone.'
                : pendingTransition === 'SHIPPED'
                ? 'Are you sure you want to dispatch this order? This will commit reserved inventory balances and notify customer with tracking.'
                : `Transition order status from ${order ? ORDER_STATUS_LABELS[order.status] : ''} to ${
                    pendingTransition ? ORDER_STATUS_LABELS[pendingTransition] : ''
                  }.`}
            </p>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">
                {pendingTransition === 'CANCELLED'
                  ? 'Cancellation Reason (Required)'
                  : 'Administrative Note (Optional)'}
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => {
                  setStatusNote(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder={
                  pendingTransition === 'CANCELLED'
                    ? 'Enter reason for cancellation...'
                    : 'Add note for order audit history...'
                }
                className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                rows={3}
              />
              {formError && (
                <p className="text-[11px] text-destructive font-medium">{formError}</p>
              )}
            </div>
          </div>
        }
        variant={pendingTransition === 'CANCELLED' ? 'destructive' : 'primary'}
        confirmLabel={
          pendingTransition === 'CANCELLED'
            ? 'Confirm Cancellation'
            : `Mark as ${pendingTransition ? ORDER_STATUS_LABELS[pendingTransition] : ''}`
        }
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleConfirmTransition}
      />
    </div>
  );
}
