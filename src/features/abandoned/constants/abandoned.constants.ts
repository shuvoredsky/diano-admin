import type { BadgeVariant } from '@/components/shared/status-badge';
import type { CheckoutStatus, NotificationChannel } from '../types/abandoned.types';

export const CHECKOUT_STATUS_VARIANTS: Record<CheckoutStatus, BadgeVariant> = {
  ACTIVE: 'info',
  ABANDONED: 'danger',
  RECOVERED: 'success',
  CONVERTED: 'purple',
  EXPIRED: 'neutral',
};

export const CHECKOUT_STATUS_LABELS: Record<CheckoutStatus, string> = {
  ACTIVE: 'Active In-Progress',
  ABANDONED: 'Abandoned',
  RECOVERED: 'Recovered',
  CONVERTED: 'Converted to Order',
  EXPIRED: 'Session Expired',
};

export const RECOVERY_CHANNELS: Array<{ value: NotificationChannel; label: string }> = [
  { value: 'SMS', label: 'SMS Notification (Banglalink/Grameenphone)' },
  { value: 'EMAIL', label: 'Email Campaign' },
  { value: 'IN_APP', label: 'In-App Web Push' },
];
