'use client';

import { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SHIPMENT_STATUS_LABELS } from '../constants/shipping.constants';
import { useUpdateShipmentStatusMutation } from '../hooks/use-shipping-queries';
import type { ShipmentEntity, ShipmentStatus } from '../types/shipping.types';

export interface UpdateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: ShipmentEntity | null;
  orderId?: string;
  onSuccess?: () => void;
}

export function UpdateShipmentModal({
  isOpen,
  onClose,
  shipment,
  orderId,
  onSuccess,
}: UpdateShipmentModalProps) {
  const [status, setStatus] = useState<ShipmentStatus>('IN_TRANSIT');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const updateMutation = useUpdateShipmentStatusMutation();

  useEffect(() => {
    if (shipment) {
      setStatus(shipment.status);
      setLocation('');
      setNote('');
    }
    setFormError(null);
  }, [shipment, isOpen]);

  if (!isOpen || !shipment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        shipmentId: shipment.id,
        orderId,
        input: {
          status,
          location: location.trim() || undefined,
          note: note.trim() || undefined,
        },
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update shipment status';
      setFormError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Update Courier Status
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

        <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Courier:</span>
            <span className="font-semibold text-foreground">{shipment.courierName}</span>
          </div>
          {shipment.trackingNumber && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tracking #:</span>
              <span className="font-mono font-medium text-foreground">{shipment.trackingNumber}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {formError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="new-status" className="text-xs font-semibold">
              New Shipment Status <span className="text-destructive">*</span>
            </Label>
            <select
              id="new-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
              required
            >
              {(Object.keys(SHIPMENT_STATUS_LABELS) as ShipmentStatus[]).map((st) => (
                <option key={st} value={st}>
                  {st} — {SHIPMENT_STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="location" className="text-xs font-semibold">
              Current Location / Hub (Optional)
            </Label>
            <Input
              id="location"
              placeholder="e.g. Tejgaon Sorting Hub, Dhaka"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="status-note" className="text-xs font-semibold">
              Checkpoint Description / Event Note
            </Label>
            <textarea
              id="status-note"
              rows={2}
              placeholder="e.g. Package arrived at distribution center, scheduled for morning delivery"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="gap-1.5 cursor-pointer"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

