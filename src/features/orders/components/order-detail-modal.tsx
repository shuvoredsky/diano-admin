'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { useAdminOrderByIdQuery } from '../hooks/use-orders-queries';
import { ORDER_STATUS_VARIANTS } from '../constants/orders.constants';

export interface OrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, isOpen, onClose }: OrderDetailModalProps) {
  const { data: order, isLoading, error } = useAdminOrderByIdQuery(orderId || undefined);

  if (!isOpen || !orderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Order #{order?.orderNumber || orderId}</h2>
            {order && (
              <StatusBadge
                status={order.status}
                variant={ORDER_STATUS_VARIANTS[order.status] || 'neutral'}
              />
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <TableSkeleton rows={6} columns={4} />
          ) : error ? (
            <div className="text-sm text-destructive">
              Failed to load order details: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          ) : order ? (
            <div className="text-xs text-muted-foreground">Order details loaded.</div>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-border p-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
