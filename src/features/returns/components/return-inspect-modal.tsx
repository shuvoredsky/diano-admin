'use client';

import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useReceiveReturnMutation } from '../hooks/use-returns-queries';
import type {
  ReturnRequestEntity,
  ReturnCondition,
  ReturnItemAction,
} from '../types/returns.types';

export interface ReturnInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnRequest: ReturnRequestEntity | null;
  onSuccess?: () => void;
}

export function ReturnInspectModal({
  isOpen,
  onClose,
  returnRequest,
  onSuccess,
}: ReturnInspectModalProps) {
  const [decisions, setDecisions] = useState<
    Record<string, { condition: ReturnCondition; action: ReturnItemAction }>
  >({});
  const [staffNote, setStaffNote] = useState('');
  const [includeShippingRefund, setIncludeShippingRefund] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const receiveMutation = useReceiveReturnMutation();

  if (!isOpen || !returnRequest) return null;

  const items = returnRequest.items || [];

  const handleConditionChange = (itemId: string, condition: ReturnCondition) => {
    setDecisions((prev) => {
      const current = prev[itemId] || { condition: 'GOOD', action: 'REFUND' };
      return { ...prev, [itemId]: { ...current, condition } };
    });
  };

  const handleActionChange = (itemId: string, action: ReturnItemAction) => {
    setDecisions((prev) => {
      const current = prev[itemId] || { condition: 'GOOD', action: 'REFUND' };
      return { ...prev, [itemId]: { ...current, action } };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payloadItems = items.map((it) => {
      const dec = decisions[it.id] || { condition: 'GOOD', action: 'REFUND' };
      return {
        itemId: it.id,
        condition: dec.condition,
        action: dec.action,
      };
    });

    try {
      await receiveMutation.mutateAsync({
        id: returnRequest.id,
        input: {
          items: payloadItems,
          staffNote: staffNote.trim() || undefined,
          includeShippingRefund,
        },
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to inspect return items';
      setFormError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Inspect Return #{returnRequest.returnNumber}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Item Inspection & Outcome Decisions ({items.length} items)
            </Label>
            <div className="space-y-3">
              {items.map((it) => {
                const dec = decisions[it.id] || { condition: 'GOOD', action: 'REFUND' };
                return (
                  <div
                    key={it.id}
                    className="rounded-xl border border-border bg-muted/20 p-3 space-y-2.5 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-foreground block">
                          {it.orderItem?.productName || 'Order Item'}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {it.orderItem?.variantName} · SKU: {it.orderItem?.sku}
                        </span>
                      </div>
                      <span className="rounded bg-muted px-2 py-0.5 font-bold font-mono text-[11px] text-foreground">
                        Qty: {it.quantity}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-muted-foreground">
                          Physical Condition
                        </Label>
                        <select
                          value={dec.condition}
                          onChange={(e) =>
                            handleConditionChange(it.id, e.target.value as ReturnCondition)
                          }
                          className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                        >
                          <option value="GOOD">GOOD (Restockable)</option>
                          <option value="DAMAGED">DAMAGED (Defective / Waste)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-muted-foreground">
                          Processing Action
                        </Label>
                        <select
                          value={dec.action}
                          onChange={(e) =>
                            handleActionChange(it.id, e.target.value as ReturnItemAction)
                          }
                          className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                        >
                          <option value="REFUND">REFUND (Approve for Refund)</option>
                          <option value="REPLACE">REPLACE (Dispatch Replacement)</option>
                          <option value="REJECT">REJECT (Deny Item)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="staff-note" className="text-xs font-semibold">
              Inspection Findings / Staff Note (Optional)
            </Label>
            <textarea
              id="staff-note"
              rows={2}
              placeholder="e.g. Item tags intact, approved for full customer refund"
              value={staffNote}
              onChange={(e) => setStaffNote(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="refund-shipping"
              checked={includeShippingRefund}
              onChange={(e) => setIncludeShippingRefund(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
            />
            <Label htmlFor="refund-shipping" className="text-xs font-medium cursor-pointer">
              Include original shipping charge in customer refund
            </Label>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={receiveMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={receiveMutation.isPending}
              className="gap-1.5 cursor-pointer"
            >
              {receiveMutation.isPending ? 'Submitting Inspection...' : 'Complete Inspection'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

