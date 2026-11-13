export type CheckoutStatus = 'ACTIVE' | 'ABANDONED' | 'RECOVERED' | 'CONVERTED' | 'EXPIRED';

export type DeviceCategory = 'DESKTOP' | 'MOBILE' | 'TABLET' | 'OTHER';

export type NotificationChannel = 'SMS' | 'EMAIL' | 'IN_APP' | 'PUSH';

export interface CheckoutSnapshotItem {
  variantId: string;
  name: string;
  sku: string;
  price: string | number;
  quantity: number;
  lineTotal: string | number;
  thumbnailUrl?: string | null;
}

export interface CheckoutCustomerInfo {
  name: string;
  phone: string;
  email?: string;
  consentForRecovery?: boolean;
}

export interface CheckoutShippingAddress {
  address: string;
  district: string;
  area: string;
  zoneName?: string;
}

export interface CheckoutCartSnapshot {
  cartId?: string;
  items: CheckoutSnapshotItem[];
  customerInfo?: CheckoutCustomerInfo;
  shippingAddress?: CheckoutShippingAddress;
  shippingCharge?: string | number;
  discount?: string | number;
  tax?: string | number;
  grandTotal?: string | number;
}

export interface AbandonedCheckoutSessionItem extends Record<string, unknown> {
  id: string;
  sessionId: string;
  userId?: string | null;
  status: CheckoutStatus;
  checkoutValue: number | string;
  lastCompletedStep?: string | null;
  deviceCategory: DeviceCategory;
  browser?: string | null;
  ipAddress?: string | null;
  consentStatus?: string | null;
  lastActivityAt: string;
  abandonedAt?: string | null;
  recoveredAt?: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  cartSnapshot?: CheckoutCartSnapshot;
  items?: CheckoutSnapshotItem[];
  customerInfo?: CheckoutCustomerInfo;
}

export interface RecoveryAttemptItem {
  id: string;
  channel: string;
  status: string;
  sentAt: string;
}

export interface AbandonedCheckoutEventItem {
  type: string;
  occurredAt: string;
  metadata: Record<string, unknown>;
}

export interface AbandonedCheckoutDetailData {
  id: string;
  sessionId: string;
  status: CheckoutStatus;
  checkoutValue: string | number;
  createdAt: string;
  lastActivityAt: string;
  abandonedAt?: string | null;
  recoveredAt?: string | null;
  abandonmentDurationMinutes?: number | null;
  deviceCategory: string;
  browser?: string | null;
  customerInfo?: CheckoutCustomerInfo | null;
  shippingAddress?: CheckoutShippingAddress | null;
  items: CheckoutSnapshotItem[];
  events: AbandonedCheckoutEventItem[];
  recoveryAttempts: RecoveryAttemptItem[];
}

export interface AbandonedCheckoutDetailResponse {
  session: AbandonedCheckoutDetailData;
}

export interface AbandonedCheckoutFilterQuery {
  page?: number;
  limit?: number;
  status?: CheckoutStatus;
  fromDate?: string;
  toDate?: string;
  minValue?: number;
  maxValue?: number;
}

export interface RecoveryTriggerInput {
  channel: NotificationChannel;
}

export interface RecoveryTriggerResult {
  success: boolean;
  attemptId?: string;
  message: string;
}
