'use client';

import { useState } from 'react';
import { X, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COMMON_COURIERS } from '../constants/shipping.constants';
import { useCreateShipmentMutation, useShippingMethodsQuery } from '../hooks/use-shipping-queries';
import type { ShipmentStatus } from '../types/shipping.types';

export interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  onSuccess?: () => void;
}

export function CreateShipmentModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  onSuccess,
}: CreateShipmentModalProps) {
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingMethodId, setShippingMethodId] = useState('');
  const [status, setStatus] = useState<ShipmentStatus>('PENDING');
  const [labelUrl, setLabelUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: methods = [] } = useShippingMethodsQuery();
  const createMutation = useCreateShipmentMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierName.trim()) {
      setFormError('Courier name is required');
      return;
    }

    setFormError(null);
    try {
      await createMutation.mutateAsync({
        orderId,
        input: {
          courierName: courierName.trim(),
          trackingNumber: trackingNumber.trim() || undefined,
          shippingMethodId: shippingMethodId || undefined,
          status,
          labelUrl: labelUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create shipment';
      setFormError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Create Shipment for #{orderNumber}
            </h2>
          </div>
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

          <div className="space-y-1.5">
            <Label htmlFor="courier-name" className="text-xs font-semibold">
              Courier Partner <span className="text-destructive">*</span>
            </Label>
            <Input
              id="courier-name"
              placeholder="e.g. Steadfast, Pathao, RedX"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              className="text-xs h-9"
              required
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {COMMON_COURIERS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCourierName(c)}
                  className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tracking-number" className="text-xs font-semibold">
                Tracking / Consignment ID
              </Label>
              <Input
                id="tracking-number"
                placeholder="e.g. CN-9281742"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="shipment-status" className="text-xs font-semibold">
                Initial Status
              </Label>
              <select
                id="shipment-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
              >
                <option value="PENDING">PENDING (Ready for Pickup)</option>
                <option value="PICKED_UP">PICKED_UP (Handed Over)</option>
                <option value="IN_TRANSIT">IN_TRANSIT (On the Way)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="shipping-method" className="text-xs font-semibold">
              Shipping Method (Optional)
            </Label>
            <select
              id="shipping-method"
              value={shippingMethodId}
              onChange={(e) => setShippingMethodId(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="">No specific method attached</option>
              {methods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code}) - {m.estimatedDays}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="label-url" className="text-xs font-semibold">
              Air Waybill / Shipping Label URL (Optional)
            </Label>
            <Input
              id="label-url"
              type="url"
              placeholder="https://courier.example/labels/xyz.pdf"
              value={labelUrl}
              onChange={(e) => setLabelUrl(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="shipment-notes" className="text-xs font-semibold">
              Internal Dispatch Notes (Optional)
            </Label>
            <textarea
              id="shipment-notes"
              rows={2}
              placeholder="e.g. Fragile package, verify cash collection upon delivery"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
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
              {createMutation.isPending ? 'Creating Shipment...' : 'Create Shipment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

