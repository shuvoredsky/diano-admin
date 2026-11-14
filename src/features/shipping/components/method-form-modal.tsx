'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateMethodMutation, useUpdateMethodMutation } from '../hooks/use-shipping-queries';
import type { ShippingMethodEntity, ShippingZoneEntity } from '../types/shipping.types';

export interface MethodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  method?: ShippingMethodEntity | null;
  zones: ShippingZoneEntity[];
}

export function MethodFormModal({ isOpen, onClose, method, zones }: MethodFormModalProps) {
  const [shippingZoneId, setShippingZoneId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [baseCharge, setBaseCharge] = useState('');
  const [perKgCharge, setPerKgCharge] = useState('0');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateMethodMutation();
  const updateMutation = useUpdateMethodMutation();

  const isEditing = Boolean(method);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (method) {
      setShippingZoneId(method.shippingZoneId);
      setName(method.name);
      setCode(method.code);
      setBaseCharge(String(method.baseCharge));
      setPerKgCharge(String(method.perKgCharge ?? '0'));
      setFreeShippingThreshold(
        method.freeShippingThreshold !== null && method.freeShippingThreshold !== undefined
          ? String(method.freeShippingThreshold)
          : ''
      );
      setEstimatedDays(method.estimatedDays);
      setSortOrder(String(method.sortOrder ?? 0));
      setIsActive(method.isActive);
    } else {
      setShippingZoneId(zones[0]?.id || '');
      setName('');
      setCode('');
      setBaseCharge('');
      setPerKgCharge('0');
      setFreeShippingThreshold('');
      setEstimatedDays('');
      setSortOrder('0');
      setIsActive(true);
    }
    setFormError(null);
  }, [method, zones, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingZoneId) {
      setFormError('Please select a shipping zone');
      return;
    }
    if (!name.trim()) {
      setFormError('Method name is required');
      return;
    }
    if (!code.trim()) {
      setFormError('Method code is required');
      return;
    }
    if (!baseCharge.trim() || isNaN(Number(baseCharge)) || Number(baseCharge) < 0) {
      setFormError('Base charge must be a valid non-negative number');
      return;
    }
    if (perKgCharge.trim() && (isNaN(Number(perKgCharge)) || Number(perKgCharge) < 0)) {
      setFormError('Per-kg charge must be a valid non-negative number');
      return;
    }
    if (
      freeShippingThreshold.trim() &&
      (isNaN(Number(freeShippingThreshold)) || Number(freeShippingThreshold) < 0)
    ) {
      setFormError('Free shipping threshold must be a valid non-negative number');
      return;
    }
    if (!estimatedDays.trim()) {
      setFormError('Estimated delivery time is required (e.g. 2-3 Days)');
      return;
    }

    setFormError(null);
    try {
      if (isEditing && method) {
        await updateMutation.mutateAsync({
          id: method.id,
          input: {
            shippingZoneId,
            name: name.trim(),
            code: code.trim().toUpperCase(),
            baseCharge: baseCharge.trim(),
            perKgCharge: perKgCharge.trim() || '0',
            freeShippingThreshold: freeShippingThreshold.trim() || null,
            estimatedDays: estimatedDays.trim(),
            sortOrder: Number(sortOrder) || 0,
            isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          shippingZoneId,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          baseCharge: baseCharge.trim(),
          perKgCharge: perKgCharge.trim() || '0',
          freeShippingThreshold: freeShippingThreshold.trim() || null,
          estimatedDays: estimatedDays.trim(),
          sortOrder: Number(sortOrder) || 0,
          isActive,
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save shipping method';
      setFormError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="text-base font-bold text-foreground">
            {isEditing ? `Edit Shipping Method: ${method?.name}` : 'Create New Shipping Method'}
          </h2>
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
            <Label htmlFor="method-zone" className="text-xs font-semibold">
              Delivery Zone <span className="text-destructive">*</span>
            </Label>
            <select
              id="method-zone"
              value={shippingZoneId}
              onChange={(e) => setShippingZoneId(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
              required
            >
              <option value="">Select a Delivery Zone</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.districts.length} districts)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="method-name" className="text-xs font-semibold">
                Method Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="method-name"
                placeholder="e.g. Standard Delivery"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="method-code" className="text-xs font-semibold">
                Method Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="method-code"
                placeholder="e.g. STD-DHK"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="text-xs h-9 font-mono uppercase"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="base-charge" className="text-xs font-semibold">
                Base Charge (BDT) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="base-charge"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 60.00"
                value={baseCharge}
                onChange={(e) => setBaseCharge(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="per-kg-charge" className="text-xs font-semibold">
                Per Kg Extra Charge (BDT)
              </Label>
              <Input
                id="per-kg-charge"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 15.00"
                value={perKgCharge}
                onChange={(e) => setPerKgCharge(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="free-threshold" className="text-xs font-semibold">
                Free Shipping Threshold (BDT)
              </Label>
              <Input
                id="free-threshold"
                type="number"
                step="0.01"
                min="0"
                placeholder="Optional, e.g. 1000.00"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="estimated-days" className="text-xs font-semibold">
                Estimated Delivery <span className="text-destructive">*</span>
              </Label>
              <Input
                id="estimated-days"
                placeholder="e.g. 2-3 Days, 24 Hours"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="space-y-1">
              <Label htmlFor="sort-order" className="text-xs font-semibold">
                Sort Order
              </Label>
              <Input
                id="sort-order"
                type="number"
                step="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="method-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              />
              <Label htmlFor="method-active" className="text-xs font-medium cursor-pointer">
                Method is Active
              </Label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 cursor-pointer">
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Method' : 'Create Method'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
