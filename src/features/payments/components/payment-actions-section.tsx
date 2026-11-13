'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { PermissionGate } from '@/components/shared/permission-gate';
import { MoneyText } from '@/components/shared/money-text';
import { useMarkCodCollectedMutation } from '../hooks/use-payments-queries';
import type { PaymentDetailEntity } from '../types/payments.types';

export interface PaymentActionsSectionProps {
  payment: PaymentDetailEntity;
  onSuccess?: () => void;
}

export function PaymentActionsSection({
  payment,
  onSuccess,
}: PaymentActionsSectionProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const markCodMutation = useMarkCodCollectedMutation();

  const isCod = payment.provider === 'COD';
  const isPaid = payment.status === 'PAID' || payment.status === 'COMPLETED';
  const isDelivered = payment.order?.status === 'DELIVERED';

  const handleConfirmCod = async () => {
    setErrorMsg(null);
    try {
      await markCodMutation.mutateAsync({
        id: payment.id,
        input: note.trim() ? { note: note.trim() } : undefined,
      });
      setIsConfirmOpen(false);
      setNote('');
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to mark COD payment as collected.';
      setErrorMsg(message);
      throw err;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
        Operational Actions
      </h4>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* COD Collection Section */}
      {isCod && !isPaid && (
        <div className="space-y-3">
          {!isDelivered ? (
            <div className="flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/10 p-3 text-xs text-warning-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-warning" />
              <div>
                <p className="font-semibold">Order Not Yet Delivered</p>
                <p className="text-[11px] opacity-90">
                  Cash on Delivery payment can only be marked as collected after the order has been delivered to the customer (current order status: <strong>{payment.order?.status || 'UNKNOWN'}</strong>).
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-primary-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Order Delivered & Ready for Settlement</p>
                <p className="text-[11px] text-muted-foreground">
                  The courier has delivered the order. You may now record receipt of the cash payment.
                </p>
              </div>
            </div>
          )}

          <PermissionGate
            permission="payment:manage"
            fallback={
              <p className="text-[11px] text-muted-foreground italic">
                You do not have permission to mark COD payments collected (`payment:manage` required).
              </p>
            }
          >
            <Button
              type="button"
              disabled={!isDelivered || markCodMutation.isPending}
              onClick={() => setIsConfirmOpen(true)}
              className="gap-2 text-xs font-medium cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark COD Collected (Settled)
            </Button>
          </PermissionGate>
        </div>
      )}

      {/* SSLCOMMERZ Gateway Information */}
      {!isCod && (
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <RefreshCw className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Gateway Synchronization</p>
              <p className="text-[11px]">
                SSLCOMMERZ transaction callbacks and IPNs update payment records automatically in real time.
                Any pending or orphan transactions are reconciled by the server background worker every 15 minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {isPaid && (
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
          <CheckCircle2 className="h-4 w-4" />
          This transaction has already been settled and marked as paid.
        </div>
      )}

      {/* Confirm Dialog for COD Collection */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Confirm COD Collection"
        description={
          <div className="space-y-3 text-xs text-foreground">
            <p>
              Are you sure you want to mark this Cash on Delivery payment of{' '}
              <strong className="text-primary">
                <MoneyText amount={payment.amount} />
              </strong>{' '}
              as collected for Order #{payment.order?.orderNumber || payment.orderId}?
            </p>
            <div>
              <label htmlFor="cod-note" className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Settlement / Courier Reference Note (Optional):
              </label>
              <textarea
                id="cod-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Received from Steadfast Courier batch #1092"
                className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        }
        confirmLabel={markCodMutation.isPending ? 'Recording...' : 'Confirm Cash Received'}
        onConfirm={handleConfirmCod}
        isLoading={markCodMutation.isPending}
      />
    </div>
  );
}
