'use client';

import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthPermissions } from '@/features/auth';
import type { ProductFormData } from './product-form-types';

export interface ProductVariantsSectionProps {
  form: UseFormReturn<ProductFormData>;
}

export function ProductVariantsSection({ form }: ProductVariantsSectionProps) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const { hasPermission } = useAuthPermissions();
  const canViewCost = hasPermission('product:view_cost');

  const addVariantRow = () => {
    const count = fields.length + 1;
    append({
      name: `Variant ${count}`,
      sku: `SKU-${Date.now().toString().slice(-6)}-${count}`,
      isActive: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Product Variants</h3>
          <p className="text-xs text-muted-foreground">
            Manage sizes, colors, and SKU configurations. At least one variant is required.
          </p>
        </div>
        <Button
          type="button"
          onClick={addVariantRow}
          size="sm"
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Variant</span>
        </Button>
      </div>

      {errors.variants?.message && (
        <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
          {errors.variants.message}
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const variantError = errors.variants?.[index];
          const variantPrice = watch(`variants.${index}.price`);
          const compareAtPrice = watch(`variants.${index}.compareAtPrice`);
          const hasCompareAtError =
            variantPrice &&
            compareAtPrice &&
            Number(compareAtPrice) < Number(variantPrice);

          return (
            <div
              key={field.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-2xs transition-colors hover:border-primary/30"
            >
              <div className="mb-3 flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-xs font-bold text-foreground">
                  Variant #{index + 1}
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      {...register(`variants.${index}.isActive`)}
                      className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Active</span>
                  </label>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      title="Remove variant"
                      aria-label={`Remove variant ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* Variant Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Size 40 / Navy"
                    {...register(`variants.${index}.name`)}
                    className="h-8 text-xs"
                  />
                  {variantError?.name && (
                    <p className="text-[10px] text-destructive">
                      {variantError.name.message}
                    </p>
                  )}
                </div>

                {/* SKU */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    SKU <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. PAN-40-NAVY"
                    {...register(`variants.${index}.sku`)}
                    className="h-8 text-xs font-mono uppercase"
                  />
                  {variantError?.sku && (
                    <p className="text-[10px] text-destructive">
                      {variantError.sku.message}
                    </p>
                  )}
                </div>

                {/* Price Override */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Price (৳ BDT)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Default product price"
                    {...register(`variants.${index}.price`, {
                      setValueAs: val => (val === '' || isNaN(val) ? undefined : Number(val)),
                    })}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Compare At Price */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Compare at (৳ BDT)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Original price"
                    {...register(`variants.${index}.compareAtPrice`, {
                      setValueAs: val => (val === '' || isNaN(val) ? null : Number(val)),
                    })}
                    className="h-8 text-xs"
                  />
                  {hasCompareAtError && (
                    <p className="text-[10px] text-destructive">
                      Must be &ge; variant price
                    </p>
                  )}
                </div>

                {/* Barcode */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Barcode
                  </label>
                  <Input
                    placeholder="EAN / UPC / Code128"
                    {...register(`variants.${index}.barcode`)}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                {/* Cost Price - Gated */}
                {canViewCost && (
                  <div className="space-y-1">
                    <label className="flex items-center gap-1 text-[11px] font-semibold text-primary-deep dark:text-primary">
                      <span>Cost Price (৳)</span>
                      <span className="rounded bg-mint/50 px-1 py-0.2 text-[9px]">Confidential</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Manufacturing / Purchase cost"
                      {...register(`variants.${index}.costPrice`, {
                        setValueAs: val => (val === '' || isNaN(val) ? null : Number(val)),
                      })}
                      className="h-8 text-xs border-primary/30"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

