'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Truck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { mapBackendValidationErrors } from '@/lib/crud';
import { useCreateSupplierMutation, useUpdateSupplierMutation } from '../hooks/use-suppliers-queries';
import type { CreateSupplierPayload, SupplierEntity } from '../types/suppliers.types';

export interface SupplierFormModalProps {
  supplier?: SupplierEntity | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  code?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export function SupplierFormModal({ supplier, isOpen, onClose }: SupplierFormModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const isEdit = Boolean(supplier);
  const createMutation = useCreateSupplierMutation();
  const updateMutation = useUpdateSupplierMutation(supplier?.id || '');

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      name: supplier?.name || '',
      code: supplier?.code || '',
      contactPerson: supplier?.contactPerson || '',
      email: supplier?.email || '',
      phone: supplier?.phone || '',
      address: supplier?.address || '',
      isActive: supplier?.isActive ?? true,
    },
  });

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  const onSubmit = async (data: FormData) => {
    setServerError(null);

    const payload: CreateSupplierPayload = {
      name: data.name.trim(),
      code: data.code?.trim().toUpperCase() || undefined,
      contactPerson: data.contactPerson?.trim() || undefined,
      email: data.email?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      address: data.address?.trim() || undefined,
      isActive: data.isActive,
    };

    if (payload.name.length < 2) {
      setError('name', { message: 'Supplier name must be at least 2 characters' });
      return;
    }

    try {
      if (isEdit && supplier) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: unknown) {
      const msg = mapBackendValidationErrors(err, setError);
      setServerError(msg || (err instanceof Error ? err.message : 'Failed to save supplier'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {isEdit ? `Edit Supplier: ${supplier?.name}` : 'Add New Supplier'}
            </h3>
            <p className="text-xs text-muted-foreground">
              Vendor contact details and purchase order credentials
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
              label="Supplier Name"
              htmlFor="name"
              required
              error={errors.name?.message}
            >
              <Input
                id="name"
                placeholder="e.g. Apex Textiles Ltd."
                {...register('name')}
              />
            </FormField>

            <FormField
              label="Supplier Code"
              htmlFor="code"
              description="Leave blank to auto-generate (e.g. SUP-XXXX)"
              error={errors.code?.message}
            >
              <Input
                id="code"
                placeholder="e.g. APEX-BD"
                className="font-mono uppercase"
                {...register('code')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Contact Person"
              htmlFor="contactPerson"
              error={errors.contactPerson?.message}
            >
              <Input
                id="contactPerson"
                placeholder="e.g. Mr. Rafiqul Islam"
                {...register('contactPerson')}
              />
            </FormField>

            <FormField
              label="Phone Number"
              htmlFor="phone"
              error={errors.phone?.message}
            >
              <Input
                id="phone"
                placeholder="+880 1712 345678"
                {...register('phone')}
              />
            </FormField>
          </div>

          <FormField
            label="Email Address"
            htmlFor="email"
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              placeholder="orders@supplier.com"
              {...register('email')}
            />
          </FormField>

          <FormField
            label="Physical Address"
            htmlFor="address"
            error={errors.address?.message}
          >
            <textarea
              id="address"
              rows={2}
              placeholder="Factory / Office address in Bangladesh"
              {...register('address')}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>

          <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs font-medium text-foreground">
            <input
              type="checkbox"
              {...register('isActive')}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span>Active Supplier (available for new purchase orders)</span>
          </label>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Supplier'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

