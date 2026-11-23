'use client';

import { useState, useEffect } from 'react';
import { X, Zap, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDirtyFormGuard } from '@/lib/crud';
import { useUpdateFlashSaleMutation } from '../hooks/use-flash-sales-queries';
import type { FlashSaleEntity } from '../types/flash-sales.types';

export interface EditFlashSaleModalProps {
  sale: FlashSaleEntity | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FlashSaleItemRow {
  variantId: string;
  discountPrice: string;
  stockLimit: string;
}

function formatDateForInput(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

export function EditFlashSaleModal({
  sale,
  isOpen,
  onClose,
}: EditFlashSaleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [items, setItems] = useState<FlashSaleItemRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (sale && isOpen) {
      setTitle(sale.title || '');
      setDescription(sale.description || '');
      setStartsAt(formatDateForInput(sale.startsAt));
      setEndsAt(formatDateForInput(sale.endsAt));
      if (sale.items && sale.items.length > 0) {
        setItems(
          sale.items.map((i) => ({
            variantId: i.variantId,
            discountPrice: String(i.discountPrice),
            stockLimit: String(i.stockLimit),
          }))
        );
      } else {
        setItems([{ variantId: '', discountPrice: '', stockLimit: '10' }]);
      }
      setFormError(null);
    }
  }, [sale, isOpen]);

  const isDirty = Boolean(
    sale &&
      (title !== (sale.title || '') ||
        description !== (sale.description || '') ||
        startsAt !== formatDateForInput(sale.startsAt) ||
        endsAt !== formatDateForInput(sale.endsAt))
  );
  useDirtyFormGuard(isDirty && isOpen);

  const updateMutation = useUpdateFlashSaleMutation();

  if (!isOpen || !sale) return null;

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
      description: description.trim() ? description.trim() : null,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      items: items.map((i) => ({
        variantId: i.variantId.trim(),
        discountPrice: i.discountPrice.trim(),
        stockLimit: Number(i.stockLimit),
      })),
    };

    try {
      await updateMutation.mutateAsync({ id: sale.id, input: payload });
      onClose();
    } catch (err: unknown) {
      // Show backend conflict/overlap errors as-is
      const msg = err instanceof Error ? err.message : 'Failed to update flash sale';
      setFormError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-bold text-foreground">Edit Flash Sale Campaign</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {formError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="edit-sale-title" className="text-xs font-semibold">
              Campaign Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-sale-title"
              placeholder="e.g. Winter Flash Frenzy 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-sale-desc" className="text-xs font-semibold">
              Description (Optional)
            </Label>
            <Input
              id="edit-sale-desc"
              placeholder="e.g. 40% OFF all seasonal apparel for 6 hours"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-sale-starts" className="text-xs font-semibold">
                Starts At (Dhaka) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-sale-starts"
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-sale-ends" className="text-xs font-semibold">
                Ends At (Dhaka) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-sale-ends"
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="text-xs"
                required
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
                className="h-7 text-xs gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Add Variant
              </Button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/20 p-2.5 text-xs"
                >
                  <div className="flex-1 space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground">
                      Variant ID #{idx + 1}
                    </Label>
                    <Input
                      placeholder="cuid-variant-id"
                      value={item.variantId}
                      onChange={(e) => handleItemChange(idx, 'variantId', e.target.value)}
                      className="h-7 text-xs font-mono"
                      required
                    />
                  </div>

                  <div className="w-24 space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground">
                      Price (৳)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={item.discountPrice}
                      onChange={(e) => handleItemChange(idx, 'discountPrice', e.target.value)}
                      className="h-7 text-xs"
                      required
                    />
                  </div>

                  <div className="w-20 space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground">
                      Stock Limit
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="10"
                      value={item.stockLimit}
                      onChange={(e) => handleItemChange(idx, 'stockLimit', e.target.value)}
                      className="h-7 text-xs"
                      required
                    />
                  </div>

                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(idx)}
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 shrink-0 mt-3.5 cursor-pointer"
                      aria-label="Remove item"
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
              disabled={updateMutation.isPending}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="cursor-pointer text-xs gap-1.5"
            >
              {updateMutation.isPending ? 'Updating Campaign...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

