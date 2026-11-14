import type { RefundStatus } from '../types/refunds.types';

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  PENDING: 'Pending Authorization',
  APPROVED: 'Approved',
  PROCESSING: 'Processing via Gateway',
  COMPLETED: 'Completed (Disbursed)',
  REJECTED: 'Rejected',
  FAILED: 'Failed',
};

export const REFUND_STATUS_VARIANTS: Record<
  RefundStatus,
  'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'purple' | 'amber' | 'neutral'
> = {
  PENDING: 'warning',
  APPROVED: 'info',
  PROCESSING: 'purple',
  COMPLETED: 'success',
  REJECTED: 'destructive',
  FAILED: 'destructive',
};

