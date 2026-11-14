'use client';

import { useState } from 'react';
import { Truck, ExternalLink, RefreshCw, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { PermissionGate } from '@/components/shared/permission-gate';
import { CreateShipmentModal } from './create-shipment-modal';
import { UpdateShipmentModal } from './update-shipment-modal';
import type { ShipmentEntity } from '../types/shipping.types';

export interface OrderShipmentsSectionProps {
  orderId: string;
  orderNumber: string;
  shipments?: ShipmentEntity[];
  onRefetch?: () => void;
}

export function OrderShipmentsSection({
  orderId,
  orderNumber,
  shipments = [],
  onRefetch,
}: OrderShipmentsSectionProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentEntity | null>(null);

  const hasShipments = shipments.length > 0;

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
          <Truck className="h-4 w-4 text-primary" />
          <span>Shipment & Courier Tracking ({shipments.length})</span>
        </div>

        <PermissionGate permissions={['order:ship', 'shipping:manage']}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-7 text-[11px] gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{hasShipments ? 'Add Another Shipment' : 'Create Shipment'}</span>
          </Button>
        </PermissionGate>
      </div>

      {!hasShipments ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
          No courier shipment has been created for this order yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {shipments.map((shipment) => (
            <div
              key={shipment.id}
              className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">
                    {shipment.courierName}
                  </span>
                  <StatusBadge status={shipment.status} />
                </div>

                <div className="flex items-center gap-2">
                  {shipment.labelUrl && (
                    <a
                      href={shipment.labelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Shipping Label</span>
                    </a>
                  )}

                  <PermissionGate permissions={['order:ship', 'shipping:manage']}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedShipment(shipment)}
                      className="h-7 text-[11px] gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Update Status</span>
                    </Button>
                  </PermissionGate>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Tracking Number</span>
                  <span className="font-mono font-bold text-foreground">
                    {shipment.trackingNumber || 'Pending Courier Scan'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Last Updated</span>
                  <span className="text-muted-foreground">
                    <DateText date={shipment.updatedAt} format="long" />
                  </span>
                </div>
                {shipment.deliveredAt && (
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Delivered At</span>
                    <span className="text-primary font-medium">
                      <DateText date={shipment.deliveredAt} format="long" />
                    </span>
                  </div>
                )}
              </div>

              {/* Checkpoints Timeline (if available) */}
              {shipment.events && shipment.events.length > 0 && (
                <div className="pt-2 border-t border-border/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    Checkpoint History ({shipment.events.length})
                  </span>
                  <div className="space-y-2 border-l-2 border-primary/20 pl-3 ml-1 text-xs">
                    {shipment.events.map((evt) => (
                      <div key={evt.id} className="relative space-y-0.5">
                        <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">{evt.status}</span>
                          <span className="text-[10px] text-muted-foreground">
                            <DateText date={evt.occurredAt || evt.createdAt} format="relative" />
                          </span>
                        </div>
                        {evt.location && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{evt.location}</span>
                          </div>
                        )}
                        <p className="text-[11px] text-muted-foreground">{evt.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        orderId={orderId}
        orderNumber={orderNumber}
        onSuccess={onRefetch}
      />

      <UpdateShipmentModal
        isOpen={Boolean(selectedShipment)}
        onClose={() => setSelectedShipment(null)}
        shipment={selectedShipment}
        orderId={orderId}
        onSuccess={onRefetch}
      />
    </div>
  );
}

