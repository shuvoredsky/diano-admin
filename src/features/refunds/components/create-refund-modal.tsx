'use client';

import { useState } from 'react';
import { X, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExecuteOrderRefundMutation } from '../hooks/use-refunds-queries';

export interface CreateRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
  onSuccess?: () => void;
}

export function CreateRefundModal({
  isOpen,
  onClose,
  defaultOrderId = '',
  onSuccess,
}: CreateRefundModalProps) {
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [refundShipping, setRefundShipping] = useState(false);
  const [manualReference, setManualReference] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const executeMutation = useExecuteOrderRefundMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
    try {
      await executeMutation.mutateAsync({
        orderId: orderId.trim(),
        amount: amount.trim() || undefined,
        reason: reason.trim(),
        refundShipping,
        manualReference: manualReference.trim() || undefined,
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to execute refund';
      setFormError(msg);
    }
  };

  return (
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {formError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {formError}
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
                placeholder="Leave blank for full order balance"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-xs h-9"
              />
              <span className="text-[10px] text-muted-foreground">
                Optional: defaults to total order settlement amount
              </span>
            </div>

            <div className="space-y-1">
              <Label htmlFor="manual-ref" className="text-xs font-semibold">
                Manual Reference ID
              </Label>
              <Input
                id="manual-ref"
                placeholder="e.g. BKASH-REF-8841"
                value={manualReference}
                onChange={(e) => setManualReference(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="refund-reason" className="text-xs font-semibold">
              Refund Reason <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="refund-reason"
              rows={2}
              placeholder="e.g. Customer cancelled before dispatch, payment double charged, etc."
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
  );
}

