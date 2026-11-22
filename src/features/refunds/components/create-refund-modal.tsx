'use client';

import { useState } from 'react';
import { X, Receipt, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { useExecuteOrderRefundMutation } from '../hooks/use-refunds-queries';

export interface CreateRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
  defaultPaymentProvider?: string;
  onSuccess?: () => void;
}

export function CreateRefundModal({
  isOpen,
  onClose,
  defaultOrderId = '',
  defaultPaymentProvider,
  onSuccess,
}: CreateRefundModalProps) {
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [refundShipping, setRefundShipping] = useState(false);
  const [manualReference, setManualReference] = useState('');
  const [refundMode, setRefundMode] = useState<'GATEWAY' | 'MANUAL'>(
    defaultPaymentProvider === 'COD' ? 'MANUAL' : 'GATEWAY'
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const executeMutation = useExecuteOrderRefundMutation();

  if (!isOpen) return null;

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setFormError('Order ID is required');
      return;
    }
    if (amount.trim() && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      setFormError('Refund amount must be a positive number');
      return;
    }
    if (!reason.trim() || reason.trim().length < 3) {
      setFormError('Refund reason must be at least 3 characters');
      return;
    }

    setFormError(null);
    setShowConfirm(true);
  };

  const handleConfirmedExecution = async () => {
    try {
      await executeMutation.mutateAsync({
        orderId: orderId.trim(),
        amount: amount.trim() || undefined,
        reason: reason.trim(),
        refundShipping,
        manualReference:
          refundMode === 'MANUAL' || manualReference.trim()
            ? manualReference.trim() || undefined
            : undefined,
      });
      setShowConfirm(false);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setShowConfirm(false);
      const msg = err instanceof Error ? err.message : 'Failed to execute refund';
      setFormError(msg);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Issue Order Refund
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handlePreSubmit} className="space-y-3.5">
            {formError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="order-id" className="text-xs font-semibold">
                Order ID / CUID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="order-id"
                placeholder="e.g. ord-1001 or cm789..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="text-xs h-9 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Refund Channel & Method</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRefundMode('GATEWAY')}
                  className={`flex flex-col items-start p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                    refundMode === 'GATEWAY'
                      ? 'border-primary bg-primary/5 text-foreground font-medium'
                      : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <span className="font-semibold text-foreground">Online Gateway</span>
                  <span className="text-[10px] text-muted-foreground">SSLCOMMERZ API reversal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRefundMode('MANUAL')}
                  className={`flex flex-col items-start p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                    refundMode === 'MANUAL'
                      ? 'border-primary bg-primary/5 text-foreground font-medium'
                      : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <span className="font-semibold text-foreground">Manual / COD / Offline</span>
                  <span className="text-[10px] text-muted-foreground">bKash, Nagad, or Cash refund</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="refund-amount" className="text-xs font-semibold">
                  Amount (BDT)
                </Label>
                <Input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Full remaining balance"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-xs h-9"
                />
                <span className="text-[10px] text-muted-foreground">
                  Optional: defaults to total remaining refundable balance
                </span>
              </div>

              <div className="space-y-1">
                <Label htmlFor="manual-ref" className="text-xs font-semibold">
                  Manual Reference {refundMode === 'MANUAL' ? '(Recommended)' : '(Offline Fallback)'}
                </Label>
                <Input
                  id="manual-ref"
                  placeholder={refundMode === 'MANUAL' ? 'e.g. BKASH-TXN-9988' : 'Optional offline ref'}
                  value={manualReference}
                  onChange={(e) => setManualReference(e.target.value)}
                  className="text-xs h-9 font-mono"
                />
                <span className="text-[10px] text-muted-foreground">
                  {refundMode === 'MANUAL'
                    ? 'Records transaction reference for accounting ledger'
                    : 'Providing reference overrides live gateway with manual settlement'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="refund-reason" className="text-xs font-semibold">
                Refund Reason <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="refund-reason"
                rows={2}
                placeholder="e.g. Customer cancelled before dispatch, defective unit, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="include-shipping"
                checked={refundShipping}
                onChange={(e) => setRefundShipping(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              />
              <Label htmlFor="include-shipping" className="text-xs font-medium cursor-pointer">
                Include shipping charge in refund
              </Label>
            </div>

            <div className="rounded-lg bg-muted/60 border border-border p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Atomic Ledger Settlement:</strong> Refunds are processed under row-level database locks and capped by total paid amount. Gateway disbursements use verified provider credentials or manual reference tracking.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={executeMutation.isPending}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={executeMutation.isPending}
                className="gap-1.5 cursor-pointer"
              >
                {executeMutation.isPending ? 'Processing Refund...' : 'Authorize Refund'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirm Refund Authorization"
        description={
          <div className="space-y-2 text-xs text-foreground">
            <p className="text-muted-foreground">
              Please verify the refund parameters before authorizing disbursement:
            </p>
            <div className="rounded-lg bg-muted/50 p-2.5 space-y-1 font-mono text-[11px]">
              <div><strong>Order:</strong> {orderId}</div>
              <div><strong>Amount:</strong> {amount ? `৳${amount}` : 'Full remaining balance'}</div>
              <div><strong>Channel:</strong> {manualReference.trim() || refundMode === 'MANUAL' ? 'Manual / Offline' : 'Online Gateway'}</div>
              {manualReference.trim() && <div><strong>Reference:</strong> {manualReference.trim()}</div>}
              <div><strong>Reason:</strong> {reason}</div>
            </div>
          </div>
        }
        confirmLabel="Confirm & Disburse"
        isLoading={executeMutation.isPending}
        onConfirm={handleConfirmedExecution}
      />
    </>
  );
}
