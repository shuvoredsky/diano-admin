export type RefundStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export interface RefundEntity {
  id: string;
  paymentId: string;
  orderId: string;
  amount: string | number;
  reason: string;
  status: RefundStatus;
  processedById?: string | null;
  providerRefundId?: string | null;
  idempotencyKey?: string | null;
  processedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  payment?: {
    id: string;
    provider: string;
    transactionId?: string | null;
    amount: string | number;
    status: string;
  };
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: string | number;
    customer?: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
    };
  };
}

export interface ExecuteOrderRefundInput {
  orderId: string;
  amount?: string | number;
  reason: string;
  paymentId?: string;
  refundShipping?: boolean;
  manualReference?: string;
}

export interface ExecuteReturnRefundInput {
  returnRequestId: string;
  amount?: string | number;
  reason: string;
  refundShipping?: boolean;
}

export interface RefundFilter {
  orderId?: string;
  paymentId?: string;
  status?: RefundStatus;
  page?: number;
  limit?: number;
}

