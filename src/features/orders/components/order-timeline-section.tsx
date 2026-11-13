'use client';

import type { OrderDetailEntity } from '../types/orders.types';
import { Timeline, type TimelineEvent } from '@/components/shared/timeline';
import { ORDER_STATUS_LABELS } from '../constants/orders.constants';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface OrderTimelineSectionProps {
  order: OrderDetailEntity;
}

export function OrderTimelineSection({ order }: OrderTimelineSectionProps) {
  // Build timeline events from statusHistory
  const timelineEvents: TimelineEvent[] = (order.statusHistory || []).map((hist, idx) => ({
    id: hist.id || `history-${idx}`,
    title: `Order Status: ${ORDER_STATUS_LABELS[hist.status] || hist.status}`,
    description: hist.note || (idx === 0 ? 'Order status recorded in system' : undefined),
    timestamp: hist.createdAt,
    status: hist.status,
    actor: hist.changedById ? `Staff (${hist.changedById.slice(0, 8)})` : undefined,
    icon:
      hist.status === 'CANCELLED' ? (
        <AlertCircle className="h-4 w-4 text-destructive" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-primary" />
      ),
  }));

  // If statusHistory is empty but order has placedAt, fallback to placed event
  if (timelineEvents.length === 0 && order.placedAt) {
    timelineEvents.push({
      id: 'placed',
      title: 'Order Placed',
      description: `Customer completed checkout for Order #${order.orderNumber}`,
      timestamp: order.placedAt,
      status: 'PENDING',
      icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
    });
  }

  return (
    <div className="space-y-3 pt-2 border-t border-border">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
        <Clock className="h-4 w-4 text-primary" />
        Order Lifecycle History
      </div>
      <Timeline events={timelineEvents} />
    </div>
  );
}
