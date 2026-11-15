'use client';

import { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDirtyFormGuard } from '@/lib/crud';
import {
  useCreateCouponMutation,
  useUpdateCouponMutation,
} from '../hooks/use-coupons-queries';
import { COUPON_TYPES, COUPON_TYPE_LABELS } from '../constants/coupons.constants';
import type { CouponEntity, CouponType } from '../types/coupons.types';

export interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponToEdit?: CouponEntity | null;
}

export function CouponFormModal({
  isOpen,
  onClose,
  couponToEdit,
}: CouponFormModalProps) {
  const isEditing = Boolean(couponToEdit);

  const [code, setCode] = useState('');
  const [type, setType] = useState<CouponType>('PERCENTAGE');
  const [value, setValue] = useState('10');
  const [minPurchase, setMinPurchase] = useState('0');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [perUserLimit, setPerUserLimit] = useState('1');
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);
  const [allowOnSale, setAllowOnSale] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const isDirty = Boolean(code || value !== '10' || isEditing);
  useDirtyFormGuard(isDirty && isOpen);

  useEffect(() => {
    if (couponToEdit) {
      setCode(couponToEdit.code);
      setType(couponToEdit.type);
      setValue(couponToEdit.value);
      setMinPurchase(couponToEdit.minPurchase);
      setMaxDiscount(couponToEdit.maxDiscount || '');
      setStartsAt(couponToEdit.startsAt ? couponToEdit.startsAt.slice(0, 10) : '');
      setExpiresAt(couponToEdit.expiresAt ? couponToEdit.expiresAt.slice(0, 10) : '');
      setUsageLimit(couponToEdit.usageLimit ? String(couponToEdit.usageLimit) : '');
      setPerUserLimit(String(couponToEdit.perUserLimit || 1));
      setFirstOrderOnly(couponToEdit.firstOrderOnly);
      setAllowOnSale(couponToEdit.allowOnSale);
      setIsActive(couponToEdit.isActive);
    } else {
      setCode('');
      setType('PERCENTAGE');
      setValue('10');
      setMinPurchase('0');
      setMaxDiscount('');
      const today = new Date().toISOString().slice(0, 10);
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      setStartsAt(today);
      setExpiresAt(nextMonth);
      setUsageLimit('');
      setPerUserLimit('1');
      setFirstOrderOnly(false);
      setAllowOnSale(false);
      setIsActive(true);
    }
    setFormError(null);
  }, [couponToEdit, isOpen]);

  const createMutation = useCreateCouponMutation();
  const updateMutation = useUpdateCouponMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError('Coupon code is required');
      return;
    }
    if (!/^[A-Za-z0-9_-]+$/.test(cleanCode)) {
      setFormError('Coupon code can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    const numValue = Number(value);
    if (type !== 'FREE_SHIPPING' && (isNaN(numValue) || numValue <= 0)) {
      setFormError('Value must be a positive number');
      return;
    }
    if (type === 'PERCENTAGE' && numValue > 100) {
      setFormError('Percentage discount cannot exceed 100%');
      return;
    }

    if (!startsAt || !expiresAt) {
      setFormError('Both start date and expiration date are required');
      return;
    }
    if (new Date(startsAt) >= new Date(expiresAt)) {
      setFormError('Expiration date must be strictly after start date');
      return;
    }

    const payload = {
      code: cleanCode,
      type,
      value: type === 'FREE_SHIPPING' ? '0' : value,
      minPurchase: minPurchase || '0',
      maxDiscount: maxDiscount.trim() ? maxDiscount.trim() : null,
      startsAt: new Date(startsAt).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      usageLimit: usageLimit.trim() ? Number(usageLimit) : null,
      perUserLimit: perUserLimit.trim() ? Number(perUserLimit) : 1,
      firstOrderOnly,
      allowOnSale,
      isActive,
    };

    try {
      if (isEditing && couponToEdit) {
        await updateMutation.mutateAsync({ id: couponToEdit.id, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save coupon';
      setFormError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              {isEditing ? `Edit Coupon "${couponToEdit?.code}"` : 'Create New Coupon'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="coupon-code" className="text-xs font-semibold">
                Coupon Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="coupon-code"
                placeholder="e.g. SUMMER25"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono text-xs uppercase"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="coupon-type" className="text-xs font-semibold">
                Discount Type <span className="text-destructive">*</span>
              </Label>
              <select
                id="coupon-type"
                value={type}
                onChange={(e) => setType(e.target.value as CouponType)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden cursor-pointer"
              >
                {COUPON_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {COUPON_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="coupon-value" className="text-xs font-semibold">
                Value {type === 'PERCENTAGE' ? '(%)' : '(৳)'}
              </Label>
              <Input
                id="coupon-value"
                type="number"
                step="0.01"
                min="0"
                value={value}
                disabled={type === 'FREE_SHIPPING'}
                onChange={(e) => setValue(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="min-purchase" className="text-xs font-semibold">
                Min Order (৳)
              </Label>
              <Input
                id="min-purchase"
                type="number"
                step="0.01"
                min="0"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="max-discount" className="text-xs font-semibold">
                Max Cap (৳)
              </Label>
              <Input
                id="max-discount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Optional"
                value={maxDiscount}
                disabled={type !== 'PERCENTAGE'}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="starts-at" className="text-xs font-semibold">
                Starts At (Dhaka) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="starts-at"
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="expires-at" className="text-xs font-semibold">
                Expires At (Dhaka) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="expires-at"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="usage-limit" className="text-xs font-semibold">
                Global Limit (Total)
              </Label>
              <Input
                id="usage-limit"
                type="number"
                placeholder="Unlimited"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="per-user-limit" className="text-xs font-semibold">
                Per-Customer Limit
              </Label>
              <Input
                id="per-user-limit"
                type="number"
                min="1"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-border/60">
            <div className="flex items-center gap-2">
              <input
                id="first-order-only"
                type="checkbox"
                checked={firstOrderOnly}
                onChange={(e) => setFirstOrderOnly(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              />
              <Label htmlFor="first-order-only" className="text-xs font-medium cursor-pointer">
                First-time orders only
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="allow-on-sale"
                type="checkbox"
                checked={allowOnSale}
                onChange={(e) => setAllowOnSale(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              />
              <Label htmlFor="allow-on-sale" className="text-xs font-medium cursor-pointer">
                Allow stack with items already on sale
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              />
              <Label htmlFor="is-active" className="text-xs font-medium cursor-pointer">
                Enable coupon immediately (Active)
              </Label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? 'Saving...' : isEditing ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
