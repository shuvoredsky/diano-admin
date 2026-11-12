'use client';

import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { AlertTriangle, CheckCircle2, Tag } from 'lucide-react';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import { calculateClientPricing } from '@/lib/utils/pricing';
import type { ProductFormData } from './product-form-types';

export interface ProductPricingSectionProps {
  form: UseFormReturn<ProductFormData>;
}

export function ProductPricingSection({ form }: ProductPricingSectionProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const mrp = watch('mrp');
  const discountType = watch('discountType') || 'NONE';
  const discountValue = watch('discountValue');
  const variants = watch('variants') || [];

  // Minimum variant cost price for warning check
  const minCostPrice = useMemo(() => {
    const costs = variants
      .map(v => v.costPrice)
      .filter((c): c is number => typeof c === 'number' && c > 0);
    return costs.length > 0 ? Math.min(...costs) : undefined;
  }, [variants]);

  const pricingPreview = useMemo(() => {
    return calculateClientPricing(mrp, discountType, discountValue, minCostPrice);
  }, [mrp, discountType, discountValue, minCostPrice]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* MRP */}
        <FormField
          label="Base MRP (৳ BDT)"
          htmlFor="mrp"
          required
          error={errors.mrp?.message}
          description="Maximum retail price in Bangladeshi Taka"
        >
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-muted-foreground">
              ৳
            </span>
            <Input
              id="mrp"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 2450.00"
              className="pl-8"
              {...register('mrp', {
                valueAsNumber: true,
              })}
            />
          </div>
        </FormField>

        {/* Discount Type */}
        <FormField
          label="Discount Type"
          htmlFor="discountType"
          error={errors.discountType?.message}
          description="Select promo or markdown structure"
        >
          <select
            id="discountType"
            {...register('discountType')}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="NONE">No Discount (Sell at MRP)</option>
            <option value="PERCENTAGE">Percentage (% Off)</option>
            <option value="FIXED">Fixed Amount (৳ Off)</option>
          </select>
        </FormField>

        {/* Discount Value */}
        {discountType !== 'NONE' && (
          <FormField
            label={
              discountType === 'PERCENTAGE'
                ? 'Discount Percentage (%)'
                : 'Discount Amount (৳ BDT)'
            }
            htmlFor="discountValue"
            required
            error={errors.discountValue?.message || pricingPreview.error}
            description={
              discountType === 'PERCENTAGE'
                ? 'Enter discount 0.01 to 99.99%'
                : `Enter discount less than MRP (৳${pricingPreview.mrp})`
            }
          >
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-muted-foreground">
                {discountType === 'PERCENTAGE' ? '%' : '৳'}
              </span>
              <Input
                id="discountValue"
                type="number"
                step="0.01"
                min="0"
                placeholder={discountType === 'PERCENTAGE' ? '15' : '200'}
                className="pl-8"
                {...register('discountValue', {
                  valueAsNumber: true,
                })}
              />
            </div>
          </FormField>
        )}
      </div>

      {/* Pricing Calculation Summary Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Live Pricing Breakdown
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Calculated according to exact backend Decimal precision rules
              </p>
            </div>
          </div>
          {pricingPreview.isValid ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Valid Pricing
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {pricingPreview.error || 'Incomplete'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <span className="text-[11px] font-medium text-muted-foreground">Base MRP</span>
            <div className="mt-1 text-lg font-bold text-foreground">
              ৳ {pricingPreview.mrp}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <span className="text-[11px] font-medium text-muted-foreground">
              Discount Applied {discountType === 'PERCENTAGE' ? `(${pricingPreview.discountValue}%)` : ''}
            </span>
            <div className="mt-1 text-lg font-bold text-destructive">
              - ৳ {pricingPreview.discountAmount}
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-mint/10 dark:bg-mint/5 p-3">
            <span className="text-[11px] font-medium text-primary-deep dark:text-primary">
              Customer Storefront Selling Price
            </span>
            <div className="mt-1 text-xl font-extrabold text-primary-deep dark:text-primary">
              ৳ {pricingPreview.sellingPrice}
            </div>
          </div>
        </div>

        {pricingPreview.warning && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{pricingPreview.warning}</span>
          </div>
        )}
      </div>
    </div>
  );
}

