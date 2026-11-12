export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentProvider = 'COD' | 'SSLCOMMERZ';

export type ShipmentStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED_ATTEMPT'
  | 'RETURNED_TO_ORIGIN'
  | 'RETURNING'
  | 'RETURNED';

export interface ShippingAddressSnapshot {
  address: string;
  district: string;
  area: string;
  zoneName?: string;
}

export interface BillingAddressSnapshot {
  address?: string;
  district?: string;
  area?: string;
}

export interface CustomerSnapshot {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  isGuest: boolean;
}

export interface OrderItemSnapshot {
  id?: string;
  variantId?: string | null;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: string | number;
  costPrice?: string | number | null;
  quantity: number;
  discount: string | number;
  lineTotal: string | number;
  attributesSnapshot?: Record<string, unknown> | null;
}

export interface OrderStatusHistoryItem {
  id: string;
  status: OrderStatus;
  changedById?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface OrderNoteItem {
  id: string;
  authorId?: string | null;
  note: string;
  isCustomerVisible: boolean;
  createdAt: string;
}

export interface OrderPaymentItem {
  id: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: string | number;
  currency: string;
  transactionId?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface OrderShipmentEntity {
  id: string;
  orderId: string;
  courierName: string;
  trackingNumber?: string | null;
  status: ShipmentStatus;
  labelUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEntity extends Record<string, unknown> {
  id: string;
  orderNumber: string;
  idempotencyKey?: string | null;
  customerId: string | null;
  status: OrderStatus;
  subtotal: string | number;
  discountTotal: string | number;
  shippingTotal: string | number;
  taxTotal: string | number;
  grandTotal: string | number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentProvider;
  shippingAddressSnapshot: ShippingAddressSnapshot;
  billingAddressSnapshot?: BillingAddressSnapshot | null;
  customerSnapshot: CustomerSnapshot;
  couponId?: string | null;
  notes?: string | null;
  placedAt: string;
  paymentDeadline?: string | null;
  confirmedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemSnapshot[];
  statusHistory?: OrderStatusHistoryItem[];
  orderNotes?: OrderNoteItem[];
  payments?: OrderPaymentItem[];
  shipments?: OrderShipmentEntity[];
  invoiceSnapshot?: {
    id: string;
    invoiceNumber: string;
    storeProfile: Record<string, unknown>;
    invoiceSettings: Record<string, unknown>;
    issuedAt: string;
  } | null;
}

export interface OrderFilterQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  note?: string;
}

export interface AddOrderNoteInput {
  note: string;
  isCustomerVisible?: boolean;
}

export interface CreateShipmentInput {
  courierName: string;
  trackingNumber?: string;
  status?: ShipmentStatus;
  labelUrl?: string;
  notes?: string;
}

export interface UpdateShipmentStatusInput {
  status: ShipmentStatus;
  location?: string;
  note?: string;
}
