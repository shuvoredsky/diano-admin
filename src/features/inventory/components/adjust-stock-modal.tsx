'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, Sliders, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { mapBackendValidationErrors } from '@/lib/crud';
import { useAdjustStockMutation, useMarkDamagedMutation } from '../hooks/use-inventory-queries';
import type { InventoryEntity } from '../types/inventory.types';

export interface AdjustStockModalProps {
  item: InventoryEntity | null;
  mode: 'ADJUST' | 'DAMAGE';
  onClose: () => void;
}

interface FormData {
  quantity: number;
  reason: string;
}

export function AdjustStockModal({ item, mode, onClose }: AdjustStockModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const adjustMutation = useAdjustStockMutation();
  const damageMutation = useMarkDamagedMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      quantity: mode === 'ADJUST' ? 1 : 1,
      reason: '',
    },
  });

  if (!item) return null;

  const isPending = adjustMutation.isPending || damageMutation.isPending || isSubmitting;

  const onSubmit = async (data: FormData) => {
    setServerError(null);

    const intQuantity = Math.trunc(Number(data.quantity));
    if (isNaN(intQuantity) || intQuantity === 0) {
      setError('quantity', { message: 'Quantity must be a non-zero integer' });
      return;
    }

    if (mode === 'DAMAGE' && intQuantity <= 0) {
      setError('quantity', { message: 'Damaged quantity must be greater than zero' });
      return;
    }

    if (data.reason.trim().length < 3) {
      setError('reason', { message: 'Reason must be at least 3 characters' });
      return;
    }

    try {
      if (mode === 'ADJUST') {
        await adjustMutation.mutateAsync({
          variantId: item.variantId,
          warehouseId: item.warehouseId,
          quantity: intQuantity,
          reason: data.reason.trim(),
        });
      } else {
        await damageMutation.mutateAsync({
          variantId: item.variantId,
          warehouseId: item.warehouseId,
          quantity: intQuantity,
          reason: data.reason.trim(),
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg = mapBackendValidationErrors(err, setError);
      setServerError(msg || (err instanceof Error ? err.message : 'Adjustment failed'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              mode === 'ADJUST'
                ? 'bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {mode === 'ADJUST' ? (
              <Sliders className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {mode === 'ADJUST' ? 'Adjust Stock Quantity' : 'Report Damaged / Quarantined Stock'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {item.variant?.product?.name} — {item.variant?.name} ({item.variant?.sku})
            </p>
          </div>
        </div>

        {/* Current Balances */}
        <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl border border-border bg-muted/20 p-3 text-center text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold">On Hand</span>
            <div className="font-bold text-foreground mt-0.5">{item.onHand}</div>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Reserved</span>
            <div className="font-bold text-foreground mt-0.5">{item.reserved}</div>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Available</span>
            <div className="font-bold text-primary-deep dark:text-primary mt-0.5">
              {item.availableStock}
            </div>
          </div>
        </div>

        {serverError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label={
              mode === 'ADJUST'
                ? 'Adjustment Quantity (+adds, -removes)'
                : 'Damaged Units (Quantity to quarantine)'
            }
            htmlFor="quantity"
            required
            error={errors.quantity?.message}
            description={
              mode === 'ADJUST'
                ? 'Enter positive integer to increase stock, negative integer to decrease stock'
                : 'Enter integer units damaged or expired. This moves stock from available to damaged.'
            }
          >
            <Input
              id="quantity"
              type="number"
              step="1"
              placeholder={mode === 'ADJUST' ? 'e.g. +5 or -2' : 'e.g. 3'}
              {...register('quantity', { valueAsNumber: true })}
            />
          </FormField>

          <FormField
            label="Adjustment Reason"
            htmlFor="reason"
            required
            error={errors.reason?.message}
            description="Minimum 3 characters explaining the reason for audit compliance"
          >
            <textarea
              id="reason"
              rows={3}
              placeholder={
                mode === 'ADJUST'
                  ? 'e.g. Found extra uncounted box during shelf re-rack'
                  : 'e.g. Water damage from leaking warehouse sprinkler'
              }
              {...register('reason')}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant={mode === 'DAMAGE' ? 'destructive' : 'default'}
              disabled={isPending}
            >
              {isPending
                ? 'Applying...'
                : mode === 'ADJUST'
                ? 'Apply Adjustment'
                : 'Quarantine Damaged Stock'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

