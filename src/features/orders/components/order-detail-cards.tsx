'use client';

import type { OrderDetailEntity } from '../types/orders.types';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { MapPin, CreditCard, Truck } from 'lucide-react';
import { PAYMENT_STATUS_VARIANTS, SHIPMENT_STATUS_VARIANTS } from '../constants/orders.constants';

export interface OrderDetailCardsProps {
  order: OrderDetailEntity;
}

export function OrderDetailCards({ order }: OrderDetailCardsProps) {
  return (
    <div className="space-y-4">
      {/* 2-Column Info Grid: Customer / Delivery & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer & Shipping Destination */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Customer & Delivery Destination
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-semibold text-foreground">
              {order.customerSnapshot?.name}
            </div>
            {order.customerSnapshot?.email && (
              <div className="text-muted-foreground">
                {order.customerSnapshot.email}
              </div>
            )}
            {order.customerSnapshot?.phone && (
              <div className="font-mono text-muted-foreground">
                {order.customerSnapshot.phone}
              </div>
            )}
            <div className="text-muted-foreground">
              {order.shippingAddressSnapshot?.address}
            </div>
            <div className="text-muted-foreground font-medium">
              {[
                order.shippingAddressSnapshot?.area,
                order.shippingAddressSnapshot?.zoneName,
                order.shippingAddressSnapshot?.district,
              ]
                .filter(Boolean)
                .join(', ')}
            </div>
          </div>
        </div>

        {/* Payment Overview */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <CreditCard className="h-4 w-4 text-primary" />
            Payment Details
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Method:</span>
              <span className="font-semibold text-foreground uppercase">
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Status:</span>
              <StatusBadge
                status={order.paymentStatus}
                variant={PAYMENT_STATUS_VARIANTS[order.paymentStatus] || 'neutral'}
              />
            </div>
            {order.payments && order.payments.length > 0 && order.payments[0] && (
              <div className="pt-1 border-t border-border/60 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trx ID:</span>
                  <span className="font-mono text-foreground font-semibold">
                    {order.payments[0].transactionId || 'N/A'}
                  </span>
                </div>
                {order.payments[0].paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid At:</span>
                    <DateText date={order.payments[0].paidAt} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipments Section (if available) */}
      {order.shipments && order.shipments.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
            <Truck className="h-4 w-4 text-primary" />
            Shipment & Logistics
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {order.shipments.map((shipment) => (
              <div
                key={shipment.id}
                className="rounded-xl border border-border bg-muted/10 p-3 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    {shipment.courierName}
                  </span>
                  <StatusBadge
                    status={shipment.status}
                    variant={SHIPMENT_STATUS_VARIANTS[shipment.status] || 'neutral'}
                  />
                </div>
                {shipment.trackingNumber && (
                  <div className="text-[11px] text-muted-foreground">
                    Tracking: <span className="font-mono font-bold text-foreground">{shipment.trackingNumber}</span>
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground">
                  Updated: <DateText date={shipment.updatedAt} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
