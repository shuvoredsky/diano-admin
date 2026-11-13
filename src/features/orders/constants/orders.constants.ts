import type { OrderStatus, PaymentStatus, ShipmentStatus } from '../types/orders.types';
import type { BadgeVariant } from '@/components/shared/status-badge';

export const ORDER_TRANSITION_TABLE: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['RETURNED'],
  RETURNED: [],
  CANCELLED: [],
  REFUNDED: [],
} as const;

export const ORDER_TRANSITION_PERMISSIONS: Record<Exclude<OrderStatus, 'PENDING'>, string> = {
  CONFIRMED: 'order:confirm',
  PROCESSING: 'order:update_status',
  PACKED: 'order:update_status',
  SHIPPED: 'order:ship',
  DELIVERED: 'order:update_status',
  CANCELLED: 'order:cancel',
  RETURNED: 'order:update_status',
  REFUNDED: 'order:update_status',
} as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending Confirmation',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded',
};

export const ORDER_STATUS_VARIANTS: Record<OrderStatus, BadgeVariant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  PACKED: 'purple',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  RETURNED: 'warning',
  REFUNDED: 'neutral',
};

export const PAYMENT_STATUS_VARIANTS: Record<PaymentStatus, BadgeVariant> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  COMPLETED: 'success',
  FAILED: 'danger',
  CANCELLED: 'danger',
  REFUNDED: 'neutral',
  PARTIALLY_REFUNDED: 'warning',
};

export const SHIPMENT_STATUS_VARIANTS: Record<ShipmentStatus, BadgeVariant> = {
  PENDING: 'warning',
  PICKED_UP: 'info',
  IN_TRANSIT: 'info',
  OUT_FOR_DELIVERY: 'warning',
  DELIVERED: 'success',
  FAILED_ATTEMPT: 'danger',
  RETURNED_TO_ORIGIN: 'danger',
  RETURNING: 'warning',
  RETURNED: 'neutral',
};

export function isAllowedTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  const allowed = ORDER_TRANSITION_TABLE[from];
  return allowed ? allowed.includes(to) : false;
}

export function getRequiredPermissionForTransition(to: OrderStatus): string {
  if (to === 'PENDING') return 'order:create';
  return ORDER_TRANSITION_PERMISSIONS[to] || 'order:update_status';
}

