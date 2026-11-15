'use client';

import { useState } from 'react';
import { MapPin, Edit2, Trash2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { PermissionGate } from '@/components/shared/permission-gate';
import { EmptyState } from '@/components/feedback/empty-state';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { useDeleteZoneMutation } from '../hooks/use-shipping-queries';
import type { ShippingZoneEntity } from '../types/shipping.types';

export interface ZonesListProps {
  zones: ShippingZoneEntity[];
  isLoading: boolean;
  onEditZone: (zone: ShippingZoneEntity) => void;
  onCreateZone: () => void;
}

export function ZonesList({ zones, isLoading, onEditZone, onCreateZone }: ZonesListProps) {
  const [zoneToDelete, setZoneToDelete] = useState<ShippingZoneEntity | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteMutation = useDeleteZoneMutation();

  const handleDeleteConfirm = async () => {
    if (!zoneToDelete) return;
    try {
      setDeleteError(null);
      await deleteMutation.mutateAsync(zoneToDelete.id);
      setZoneToDelete(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete shipping zone';
      setDeleteError(msg);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-card/60 animate-pulse p-4" />
        ))}
      </div>
    );
  }

  if (zones.length === 0) {
    return (
      <EmptyState
        title="No Delivery Zones Configured"
        description="Delivery zones group Bangladesh districts together to determine courier shipping charges and delivery time estimates."
        action={
          <PermissionGate permission="shipping:manage">
            <Button size="sm" onClick={onCreateZone} className="gap-1.5">
              <MapPin className="h-4 w-4" />
              Add First Zone
            </Button>
          </PermissionGate>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {zones.map((zone) => {
        const districts = zone.districts || [];
        const previewDistricts = districts.slice(0, 8);
        const remainingCount = districts.length - previewDistricts.length;

        return (
          <div
            key={zone.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between shadow-2xs"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {zone.name}
                </span>
                <StatusBadge
                  status={zone.isActive ? 'ACTIVE' : 'INACTIVE'}
                />
                {zone.methods && zone.methods.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <Layers className="h-3 w-3" />
                    {zone.methods.length} {zone.methods.length === 1 ? 'Method' : 'Methods'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1 pt-1">
                {previewDistricts.map((d) => (
                  <span
                    key={d}
                    className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground font-medium"
                  >
                    {d}
                  </span>
                ))}
                {remainingCount > 0 && (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-semibold">
                    +{remainingCount} more
                  </span>
                )}
              </div>

              <div className="text-[11px] text-muted-foreground pt-0.5">
                Created <DateText date={zone.createdAt} format="relative" />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <PermissionGate permission="shipping:manage">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditZone(zone)}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoneToDelete(zone)}
                  className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </PermissionGate>
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        open={Boolean(zoneToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setZoneToDelete(null);
            setDeleteError(null);
          }
        }}
        title={`Delete Zone "${zoneToDelete?.name}"?`}
        description={
          <div className="space-y-2">
            <p>
              Are you sure you want to delete this shipping zone? Any delivery calculation rules mapped to this zone may fail if orders are placed for its districts.
            </p>
            {deleteError && (
              <div
                className="rounded-lg bg-destructive/10 p-2.5 text-xs font-medium text-destructive border border-destructive/20"
                role="alert"
              >
                {deleteError}
              </div>
            )}
          </div>
        }
        variant="destructive"
        confirmLabel="Delete Zone"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

