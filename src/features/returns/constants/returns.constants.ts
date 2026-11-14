import type { ReturnStatus } from '../types/returns.types';

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  REQUESTED: 'Return Requested',
  APPROVED: 'Approved (Awaiting Return)',
  REJECTED: 'Rejected',
  ITEM_RECEIVED: 'Item Received at Hub',
  RECEIVED: 'Received at Warehouse',
  INSPECTED: 'Inspected',
  REFUNDED: 'Refunded',
  REPLACED: 'Replacement Dispatched',
  CANCELLED: 'Cancelled',
};

export const RETURN_STATUS_VARIANTS: Record<
  ReturnStatus,
  'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'purple' | 'amber' | 'neutral'
> = {
  REQUESTED: 'warning',
  APPROVED: 'info',
  REJECTED: 'destructive',
  ITEM_RECEIVED: 'purple',
  RECEIVED: 'primary',
  INSPECTED: 'amber',
  REFUNDED: 'success',
  REPLACED: 'success',
  CANCELLED: 'neutral',
};

