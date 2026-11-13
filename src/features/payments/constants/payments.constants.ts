import type { BadgeVariant } from '@/components/shared/status-badge';
import type { PaymentProvider, PaymentStatus } from '../types/payments.types';

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  INITIATED: 'Initiated',
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  PAID: 'Paid',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  REFUND_PENDING: 'Refund Pending',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially Refunded',
};

export const PAYMENT_STATUS_VARIANTS: Record<PaymentStatus, BadgeVariant> = {
  INITIATED: 'neutral',
  PENDING: 'warning',
  PROCESSING: 'info',
  PAID: 'success',
  COMPLETED: 'success',
  FAILED: 'danger',
  CANCELLED: 'danger',
  EXPIRED: 'neutral',
  REFUND_PENDING: 'warning',
  REFUNDED: 'purple',
  PARTIALLY_REFUNDED: 'warning',
};

export const PAYMENT_PROVIDERS: Array<{ value: PaymentProvider; label: string; enabled: boolean }> = [
  { value: 'SSLCOMMERZ', label: 'SSLCOMMERZ (Cards / MFS / Net Banking)', enabled: true },
  { value: 'COD', label: 'Cash on Delivery (COD)', enabled: true },
];

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  SSLCOMMERZ: 'SSLCOMMERZ',
  COD: 'Cash on Delivery',
};

export const PAYMENT_STATUS_OPTIONS: Array<{ value: PaymentStatus; label: string }> = [
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'REFUND_PENDING', label: 'Refund Pending' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'PARTIALLY_REFUNDED', label: 'Partially Refunded' },
];
