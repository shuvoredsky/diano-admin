'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { ShoppingCart, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { MoneyText } from '@/components/shared/money-text';
import { mapBackendValidationErrors } from '@/lib/crud';
import { useSuppliersQuery } from '@/features/suppliers';
import { useCreatePurchaseOrderMutation } from '../hooks/use-purchases-queries';
import type { CreatePurchaseOrderPayload } from '../types/purchases.types';

export interface PurchaseOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ItemRow {
  variantId: string;
  orderedQuantity: number;
  unitCost: number;
}

interface FormData {
  supplierId: string;
  warehouseId?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  items: ItemRow[];
}

export function PurchaseOrderFormModal({ isOpen, onClose }: PurchaseOrderFormModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: suppliersData } = useSuppliersQuery({ limit: 100, isActive: true });
  const suppliers = suppliersData?.data || [];

  const createMutation = useCreatePurchaseOrderMutation();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      supplierId: '',
      items: [
        {
          variantId: '',
          orderedQuantity: 10,
          unitCost: 100,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const itemsWatch = watch('items') || [];
  const totalAmount = itemsWatch.reduce((acc, curr) => {
    const qty = Number(curr.orderedQuantity) || 0;
    const cost = Number(curr.unitCost) || 0;
    return acc + qty * cost;
  }, 0);

  if (!isOpen) return null;

  const isPending = createMutation.isPending || isSubmitting;

  const onSubmit = async (data: FormData) => {
    setServerError(null);

    if (!data.supplierId) {
      setError('supplierId', { message: 'Please select a supplier' });
      return;
    }

    if (data.items.length === 0) {
      setServerError('Purchase order must contain at least one line item');
      return;
    }

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (!item?.variantId?.trim()) {
        setError(`items.${i}.variantId`, { message: 'Variant ID is required' });
        return;
      }
      if (!item.orderedQuantity || item.orderedQuantity <= 0) {
        setError(`items.${i}.orderedQuantity`, { message: 'Quantity must be > 0' });
        return;
      }
      if (!item.unitCost || item.unitCost <= 0) {
        setError(`items.${i}.unitCost`, { message: 'Unit cost must be > 0' });
        return;
      }
    }

    const payload: CreatePurchaseOrderPayload = {
      supplierId: data.supplierId,
      warehouseId: data.warehouseId?.trim() || undefined,
      expectedDeliveryDate: data.expectedDeliveryDate || undefined,
      notes: data.notes?.trim() || undefined,
      items: data.items.map(item => ({
        variantId: item.variantId.trim(),
        orderedQuantity: Math.trunc(Number(item.orderedQuantity)),
        unitCost: Number(item.unitCost),
      })),
    };

    try {
      await createMutation.mutateAsync(payload);
      onClose();
    } catch (err: unknown) {
      const msg = mapBackendValidationErrors(err, setError);
      setServerError(msg || (err instanceof Error ? err.message : 'Failed to create purchase order'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Create Purchase Order (Draft)</h3>
            <p className="text-xs text-muted-foreground">
              Procure stock variants from vendor partners
            </p>
          </div>
        </div>

        {serverError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Supplier"
              htmlFor="supplierId"
              required
              error={errors.supplierId?.message}
            >
              <select
                id="supplierId"
                {...register('supplierId')}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select Vendor / Supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Expected Delivery Date"
              htmlFor="expectedDeliveryDate"
              error={errors.expectedDeliveryDate?.message}
            >
              <Input
                id="expectedDeliveryDate"
                type="date"
                {...register('expectedDeliveryDate')}
              />
            </FormField>
          </div>

          <FormField
            label="Internal Notes"
            htmlFor="notes"
            error={errors.notes?.message}
          >
            <Input
              id="notes"
              placeholder="e.g. Eid season preorder batch #1"
              {...register('notes')}
            />
          </FormField>

          {/* Line Items */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold text-foreground">PO Line Items</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  append({
                    variantId: '',
                    orderedQuantity: 10,
                    unitCost: 100,
                  })
                }
                className="flex items-center gap-1 text-xs"
              >
                <Plus className="h-3 w-3" />
                <span>Add Item</span>
              </Button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => {
                const row = itemsWatch[index];
                const lineTotal = (row?.orderedQuantity || 0) * (row?.unitCost || 0);

                return (
                  <div
                    key={field.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Variant ID / SKU
                      </label>
                      <Input
                        placeholder="Variant ID"
                        {...register(`items.${index}.variantId`)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="w-full sm:w-28 space-y-1">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Qty (Units)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="10"
                        {...register(`items.${index}.orderedQuantity`, { valueAsNumber: true })}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="w-full sm:w-32 space-y-1">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Unit Cost (৳)
                      </label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="100.00"
                        {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="w-full sm:w-28 pt-2 sm:pt-4 text-right">
                      <span className="text-xs font-bold text-foreground">
                        <MoneyText amount={lineTotal} />
                      </span>
                    </div>

                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors pt-2 sm:pt-4 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Summary */}
          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-mint/10 dark:bg-mint/5 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-deep dark:text-primary">
              Estimated Total Purchase Amount:
            </span>
            <span className="text-lg font-black text-primary-deep dark:text-primary">
              <MoneyText amount={totalAmount} />
            </span>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Saving PO...' : 'Create Draft PO'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

