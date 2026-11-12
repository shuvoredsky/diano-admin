'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ClipboardCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { mapBackendValidationErrors } from '@/lib/crud';
import { useStartStockAuditMutation, useInventoryListQuery } from '../hooks/use-inventory-queries';
import type { StartAuditInput } from '../types/inventory.types';

export interface StartAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  warehouseId: string;
  notes?: string;
}

export function StartAuditModal({ isOpen, onClose, onSuccess }: StartAuditModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const startMutation = useStartStockAuditMutation();
  const { data: invData } = useInventoryListQuery({ limit: 100 });

  // Extract unique warehouses from inventory items
  const warehouses = Array.from(
    new Map(
      (invData?.data || [])
        .filter((item) => Boolean(item.warehouseId))
        .map((item) => [
          item.warehouseId,
          {
            id: item.warehouseId,
            name: item.warehouse?.name || item.warehouseId,
            code: item.warehouse?.code || '',
          },
        ])
    ).values()
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      warehouseId: warehouses[0]?.id || '',
      notes: '',
    },
  });

  if (!isOpen) return null;

  const isPending = startMutation.isPending || isSubmitting;

  const onSubmit = async (data: FormData) => {
    setServerError(null);

    if (!data.warehouseId.trim()) {
      setError('warehouseId', { message: 'Warehouse is required' });
      return;
    }

    try {
      const payload: StartAuditInput = {
        warehouseId: data.warehouseId.trim(),
        notes: data.notes?.trim() || undefined,
      };

      await startMutation.mutateAsync(payload);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = mapBackendValidationErrors(err, setError);
      setServerError(msg || (err instanceof Error ? err.message : 'Failed to start audit'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Start Stock Audit</h2>
            <p className="text-xs text-muted-foreground">Initiate a physical count session for a warehouse</p>
          </div>
        </div>

        {serverError && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <FormField label="Warehouse" error={errors.warehouseId?.message} required>
            {warehouses.length > 0 ? (
              <select
                {...register('warehouseId')}
                disabled={isPending}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} {wh.code ? `(${wh.code})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                {...register('warehouseId')}
                placeholder="Enter warehouse ID (e.g. WH-DHK-01)"
                disabled={isPending}
              />
            )}
          </FormField>

          <FormField label="Notes (Optional)" error={errors.notes?.message}>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="e.g. End of month physical inventory audit"
              disabled={isPending}
              className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:border-primary focus:outline-hidden"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Starting...' : 'Start Audit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
