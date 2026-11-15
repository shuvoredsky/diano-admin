'use client';

import { useState } from 'react';
import { X, Zap, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDirtyFormGuard } from '@/lib/crud';
import { useCreateFlashSaleMutation } from '../hooks/use-flash-sales-queries';

export interface CreateFlashSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FlashSaleItemRow {
  variantId: string;
  discountPrice: string;
  stockLimit: string;
}

export function CreateFlashSaleModal({
  isOpen,
  onClose,
}: CreateFlashSaleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [items, setItems] = useState<FlashSaleItemRow[]>([
    { variantId: '', discountPrice: '', stockLimit: '10' },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const isDirty = Boolean(title || description || items.some((i) => i.variantId));
  useDirtyFormGuard(isDirty && isOpen);

  const createMutation = useCreateFlashSaleMutation();

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [...prev, { variantId: '', discountPrice: '', stockLimit: '10' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof FlashSaleItemRow, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle || cleanTitle.length < 3) {
      setFormError('Campaign title must be at least 3 characters');
      return;
    }

    if (!startsAt || !endsAt) {
      setFormError('Both start date and end date are required');
      return;
    }

    if (new Date(startsAt) >= new Date(endsAt)) {
      setFormError('End date must be strictly after start date');
      return;
    }

    if (items.length === 0) {
      setFormError('At least one product variant must be allocated to the flash sale');
      return;
    }

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      if (!item) continue;
      if (!item.variantId.trim()) {
        setFormError(`Row #${idx + 1}: Variant ID is required`);
        return;
      }
      const price = Number(item.discountPrice);
      if (isNaN(price) || price <= 0) {
        setFormError(`Row #${idx + 1}: Discount price must be a positive number`);
        return;
      }
      const limit = Number(item.stockLimit);
      if (isNaN(limit) || limit <= 0) {
        setFormError(`Row #${idx + 1}: Stock limit must be a positive number`);
        return;
      }
    }

    const payload = {
      title: cleanTitle,
      description: description.trim() ? description.trim() : undefined,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      isActive: true,
      items: items.map((i) => ({
        variantId: i.variantId.trim(),
        discountPrice: i.discountPrice.trim(),
        stockLimit: Number(i.stockLimit),
      })),
    };

    try {
      await createMutation.mutateAsync(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to launch flash sale';
      setFormError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-bold text-foreground">Launch Flash Sale Campaign</h2>
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

          <div className="space-y-1">
            <Label htmlFor="sale-title" className="text-xs font-semibold">
              Campaign Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sale-title"
              placeholder="e.g. Midnight Craze 50% Off"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="sale-desc" className="text-xs font-semibold">
              Description (Optional)
            </Label>
            <Input
              id="sale-desc"
              placeholder="e.g. Limited midnight promotion for winter knitwear"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sale-starts" className="text-xs font-semibold">
                Starts At (Dhaka) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sale-starts"
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sale-ends" className="text-xs font-semibold">
                Ends At (Dhaka) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sale-ends"
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Dynamic Variant Rows */}
          <div className="space-y-2.5 border-t border-border/60 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Allocated Product Variants ({items.length})
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="h-7 gap-1 text-[11px] cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/20 p-2.5"
                >
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="Variant ID (e.g. var-panjabi-l)"
                      value={item.variantId}
                      onChange={(e) => handleItemChange(index, 'variantId', e.target.value)}
                      className="font-mono text-xs h-8"
                    />
                  </div>

                  <div className="w-32 space-y-1">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price (৳)"
                      value={item.discountPrice}
                      onChange={(e) => handleItemChange(index, 'discountPrice', e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>

                  <div className="w-24 space-y-1">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty Limit"
                      value={item.stockLimit}
                      onChange={(e) => handleItemChange(index, 'stockLimit', e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>

                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="gap-1.5 cursor-pointer"
            >
              {createMutation.isPending ? 'Launching Sale...' : 'Launch Campaign'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

