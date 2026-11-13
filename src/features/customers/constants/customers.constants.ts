import type { BadgeVariant } from '@/components/shared/status-badge';
import type { CustomerStatus } from '../types/customers.types';

export const CUSTOMER_STATUS_VARIANTS: Record<CustomerStatus, BadgeVariant> = {
  ACTIVE: 'success',
  SUSPENDED: 'danger',
  INACTIVE: 'neutral',
  PENDING_VERIFICATION: 'warning',
};

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  ACTIVE: 'Active Customer',
  SUSPENDED: 'Suspended Account',
  INACTIVE: 'Inactive',
  PENDING_VERIFICATION: 'Pending Verification',
};
