export type ReturnStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ITEM_RECEIVED'
  | 'RECEIVED'
  | 'INSPECTED'
  | 'REFUNDED'
  | 'REPLACED'
  | 'CANCELLED';

export type ReturnCondition = 'GOOD' | 'DAMAGED';
export type ReturnItemAction = 'REFUND' | 'REPLACE' | 'REJECT';

export interface ReturnItemEntity {
  id: string;
  returnRequestId: string;
  orderItemId: string;
  quantity: number;
  condition: string | null;
  action: string | null;
  createdAt: string;
  orderItem?: {
    id: string;
    productName: string;
    variantName: string;
    sku: string;
    unitPrice: string | number;
    quantity: number;
    lineTotal: string | number;
    variantId?: string | null;
  };
}

export interface ReturnReasonEntity {
  id: string;
  reason: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface ReturnRequestEntity {
  id: string;
  returnNumber: string;
  orderId: string;
  customerId: string;
  status: ReturnStatus;
  refundAmount: string | null;
  reasonId: string | null;
  customerNote: string | null;
  staffNote: string | null;
  requestedAt: string;
  inspectedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items?: ReturnItemEntity[];
  reason?: ReturnReasonEntity | null;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus?: string;
    totalAmount?: string | number;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export interface ReviewReturnInput {
  action: 'APPROVE' | 'REJECT';
  staffNote?: string;
}

export interface ReceiveReturnItemInput {
  itemId: string;
  condition: ReturnCondition;
  action: ReturnItemAction;
  warehouseId?: string;
}

export interface ReceiveReturnInput {
  items: ReceiveReturnItemInput[];
  staffNote?: string;
  includeShippingRefund?: boolean;
}

export interface ReturnFilter {
  orderId?: string;
  customerId?: string;
  status?: ReturnStatus;
  page?: number;
  limit?: number;
}

