'use client';

import { useState } from 'react';
import type { OrderDetailEntity, OrderStatus } from '../types/orders.types';
import {
  ORDER_TRANSITION_TABLE,
  ORDER_STATUS_LABELS,
  getRequiredPermissionForTransition,
} from '../constants/orders.constants';
import { useUpdateOrderStatusMutation } from '../hooks/use-orders-queries';
import { PermissionGate } from '@/components/shared/permission-gate';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { Button } from '@/components/ui/button';

export interface OrderStatusActionsProps {
  order: OrderDetailEntity;
  onStatusUpdated: () => void;
  onError: (msg: string) => void;
}

export function OrderStatusActions({ order, onStatusUpdated, onError }: OrderStatusActionsProps) {
  const [pendingTransition, setPendingTransition] = useState<OrderStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const updateStatusMutation = useUpdateOrderStatusMutation();

  const handleInitiateTransition = (status: OrderStatus) => {
    setPendingTransition(status);
    setStatusNote('');
    setFormError(null);
  };

  const handleConfirmTransition = async () => {
    if (!pendingTransition) return;

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
      onStatusUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update order status';
      onError(msg);
      throw err;
    }
  };

  const nextTransitions = ORDER_TRANSITION_TABLE[order.status] || [];

  return (
    <>
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
        title={`Transition Order #${order.orderNumber} to ${
          pendingTransition ? ORDER_STATUS_LABELS[pendingTransition] : ''
        }`}
        description={
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              {pendingTransition === 'CANCELLED'
                ? 'Are you sure you want to cancel this order? This will release reserved inventory back to warehouse stock and notify the customer. This action cannot be undone.'
                : pendingTransition === 'SHIPPED'
                ? 'Are you sure you want to dispatch this order? This will commit reserved inventory balances and notify customer with tracking.'
                : `Transition order status from ${ORDER_STATUS_LABELS[order.status] || order.status} to ${
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
    </>
  );
}
