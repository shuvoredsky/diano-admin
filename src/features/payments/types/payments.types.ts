export type PaymentStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentProvider = 'SSLCOMMERZ' | 'COD';

export interface PaymentOrderReference {
  id: string;
  orderNumber?: string;
  status: string;
  customerId?: string | null;
  grandTotal?: number | string;
}

export interface PaymentEventItem {
  id: string;
  paymentId: string;
  provider: PaymentProvider;
  eventId: string;
  eventType: string;
  rawPayloadRedacted?: Record<string, unknown>;
  signatureValid: boolean;
  processedAt: string;
  createdAt: string;
}

export interface PaymentRefundItem {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number | string;
  reason: string;
  status: string;
  processedById: string | null;
  providerRefundId?: string | null;
  idempotencyKey?: string | null;
  processedAt?: string | null;
  createdAt: string;
}

export interface PaymentListItem extends Record<string, unknown> {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number | string;
  currency: string;
  transactionId: string | null;
  providerReference: string | null;
  bankTranId: string | null;
  idempotencyKey?: string | null;
  paymentFee?: number | string;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  order?: PaymentOrderReference | null;
  refunds?: PaymentRefundItem[];
}

export interface PaymentDetailEntity extends PaymentListItem {
  events?: PaymentEventItem[];
}

export interface ListPaymentsFilter {
  page?: number;
  limit?: number;
  provider?: PaymentProvider;
  status?: PaymentStatus;
  orderId?: string;
  startDate?: string;
  endDate?: string;
}

export interface MarkCodCollectedInput {
  note?: string;
}
