export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'ORDERED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrderItemEntity {
  id: string;
  purchaseOrderId: string;
  variantId: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  lineTotal: number;
  createdAt: string;
  updatedAt: string;
  variant?: {
    id: string;
    sku: string;
    name: string;
    costPrice: number | null;
  };
}

export interface PurchaseOrderEntity {
  id: string;
  poNumber: string;
  supplierId: string;
  warehouseId: string | null;
  status: PurchaseOrderStatus;
  totalAmount: number;
  orderedAt: string | null;
  expectedDeliveryDate: string | null;
  receivedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: string;
    name: string;
    code: string;
    phone: string | null;
  };
  warehouse?: {
    id: string;
    name: string;
    code: string;
  } | null;
  items?: PurchaseOrderItemEntity[];
}

export interface CreatePoItemInput {
  variantId: string;
  orderedQuantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  warehouseId?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  items: CreatePoItemInput[];
}

export interface ReceivePoItemInput {
  variantId: string;
  quantity: number;
}

export interface ReceivePurchaseOrderPayload {
  items: ReceivePoItemInput[];
  notes?: string;
}

export interface PurchaseOrderFilterQuery {
  page?: number;
  limit?: number;
  status?: PurchaseOrderStatus;
  supplierId?: string;
  warehouseId?: string;
  variantId?: string;
  startDate?: string;
  endDate?: string;
}

