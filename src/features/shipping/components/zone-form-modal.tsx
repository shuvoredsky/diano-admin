'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BD_DISTRICTS } from '../constants/shipping.constants';
import { useCreateZoneMutation, useUpdateZoneMutation } from '../hooks/use-shipping-queries';
import type { ShippingZoneEntity } from '../types/shipping.types';

export interface ZoneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone?: ShippingZoneEntity | null;
}

export function ZoneFormModal({ isOpen, onClose, zone }: ZoneFormModalProps) {
  const [name, setName] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateZoneMutation();
  const updateMutation = useUpdateZoneMutation();

  const isEditing = Boolean(zone);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (zone) {
      setName(zone.name);
      setSelectedDistricts(zone.districts || []);
      setIsActive(zone.isActive);
    } else {
      setName('');
      setSelectedDistricts([]);
      setIsActive(true);
    }
    setFormError(null);
    setFilterQuery('');
  }, [zone, isOpen]);

  if (!isOpen) return null;

  const toggleDistrict = (district: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(district) ? prev.filter((d) => d !== district) : [...prev, district]
    );
  };

  const handleSelectAll = () => {
    setSelectedDistricts([...BD_DISTRICTS]);
  };

  const handleClearAll = () => {
    setSelectedDistricts([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Zone name is required');
      return;
    }
    if (selectedDistricts.length === 0) {
      setFormError('At least one district must be selected');
      return;
    }

    setFormError(null);
    try {
      if (isEditing && zone) {
        await updateMutation.mutateAsync({
          id: zone.id,
          input: {
            name: name.trim(),
            districts: selectedDistricts,
            isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          districts: selectedDistricts,
          isActive,
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save shipping zone';
      setFormError(msg);
    }
  };

  const filteredDistricts = BD_DISTRICTS.filter((d) =>
    d.toLowerCase().includes(filterQuery.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="text-base font-bold text-foreground">
            {isEditing ? `Edit Shipping Zone: ${zone?.name}` : 'Create New Shipping Zone'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="zone-name" className="text-xs font-semibold">
              Zone Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="zone-name"
              placeholder="e.g. Inside Dhaka, Chittagong Division, All Bangladesh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Covered Districts ({selectedDistricts.length} selected){' '}
                <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-7 text-[11px] px-2 cursor-pointer"
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-7 text-[11px] px-2 text-muted-foreground cursor-pointer"
                >
                  Clear
                </Button>
              </div>
            </div>

            <Input
              placeholder="Search districts..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="text-xs h-8"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto rounded-lg border border-border p-2 bg-muted/20">
              {filteredDistricts.map((district) => {
                const selected = selectedDistricts.includes(district);
                return (
                  <button
                    key={district}
                    type="button"
                    onClick={() => toggleDistrict(district)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
                      selected
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span className="truncate">{district}</span>
                    {selected && <Check className="h-3.5 w-3.5 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="zone-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
            />
            <Label htmlFor="zone-active" className="text-xs font-medium cursor-pointer">
              Zone is Active for Delivery Calculation
            </Label>
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
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Zone' : 'Create Zone'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
