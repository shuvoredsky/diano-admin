'use client';

import { useState } from 'react';
import { PackageCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { useReceivePurchaseOrderMutation } from '../hooks/use-purchases-queries';
import type { PurchaseOrderEntity } from '../types/purchases.types';

export interface PurchaseOrderReceiveModalProps {
  po: PurchaseOrderEntity;
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseOrderReceiveModal({
  po,
  isOpen,
  onClose,
}: PurchaseOrderReceiveModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const item of po.items || []) {
      const remaining = Math.max(0, item.orderedQuantity - item.receivedQuantity);
      if (remaining > 0) {
        initial[item.variantId] = remaining;
      }
    }
    return initial;
  });

  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const receiveMutation = useReceivePurchaseOrderMutation(po.id);

  if (!isOpen) return null;

  const handleQtyChange = (variantId: string, val: number, maxAllowed: number) => {
    const safeVal = Math.min(maxAllowed, Math.max(0, Math.trunc(val)));
    setQuantities(prev => ({
      ...prev,
      [variantId]: safeVal,
    }));
  };

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const itemsToReceive = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([variantId, qty]) => ({ variantId, quantity: qty }));

    if (itemsToReceive.length === 0) {
      setErrorMessage('Please specify at least 1 unit to receive.');
      return;
    }

    try {
      await receiveMutation.mutateAsync({
        items: itemsToReceive,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to receive goods against purchase order'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Receive Inbound Goods: #{po.poNumber}
            </h3>
            <p className="text-xs text-muted-foreground">
              Vendor: {po.supplier?.name} • Partial receiving is supported
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleReceive} className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
              <span className="col-span-5">Variant SKU / Name</span>
              <span className="col-span-2 text-center">Ordered</span>
              <span className="col-span-2 text-center">Received</span>
              <span className="col-span-3 text-right">Receive Now</span>
            </div>

            {po.items?.map(item => {
              const remaining = Math.max(0, item.orderedQuantity - item.receivedQuantity);
              const currentInput = quantities[item.variantId] ?? 0;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 rounded-xl border border-border bg-muted/20 p-2.5 text-xs"
                >
                  <div className="col-span-5 truncate">
                    <span className="font-semibold text-foreground block truncate">
                      {item.variant?.name || 'Variant'}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {item.variant?.sku}
                    </span>
                  </div>

                  <div className="col-span-2 text-center font-bold text-foreground">
                    {item.orderedQuantity}
                  </div>

                  <div className="col-span-2 text-center font-medium text-emerald-600 dark:text-emerald-400">
                    {item.receivedQuantity}
                  </div>

                  <div className="col-span-3 flex justify-end">
                    {remaining > 0 ? (
                      <Input
                        type="number"
                        min="0"
                        max={remaining}
                        value={currentInput}
                        onChange={e =>
                          handleQtyChange(
                            item.variantId,
                            parseInt(e.target.value, 10) || 0,
                            remaining
                          )
                        }
                        className="h-7 w-20 text-center text-xs"
                        aria-label={`Receive quantity for ${item.variant?.sku}`}
                      />
                    ) : (
                      <span className="text-[11px] font-semibold text-muted-foreground italic">
                        Complete
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <FormField
            label="Receiving Notes (Optional)"
            htmlFor="notes"
            description="Inspection notes, warehouse bay, or batch tracking"
          >
            <Input
              id="notes"
              placeholder="e.g. Received in good condition at Main Bay 2"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </FormField>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={receiveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={receiveMutation.isPending}
            >
              {receiveMutation.isPending ? 'Processing Stock Inbound...' : 'Confirm Receipt & Update Stock'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

