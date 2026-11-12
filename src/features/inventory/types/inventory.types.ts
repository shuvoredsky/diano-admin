export type StockMovementType =
  | 'PURCHASE_RECEIPT'
  | 'ORDER_RESERVATION'
  | 'ORDER_RELEASE'
  | 'ORDER_FULFILLMENT'
  | 'ORDER_CANCELLATION'
  | 'RETURN_RESTOCK'
  | 'DAMAGE_ADJUSTMENT'
  | 'AUDIT_ADJUSTMENT'
  | 'MANUAL_ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export type StockAction =
  | 'RECEIVE'
  | 'RESERVE'
  | 'RELEASE'
  | 'COMMIT'
  | 'ADJUST'
  | 'DAMAGE'
  | 'RESTOCK'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN';

export interface InventoryEntity {
  id: string;
  variantId: string;
  warehouseId: string;
  onHand: number;
  reserved: number;
  damaged: number;
  safetyStock: number;
  availableStock: number;
  createdAt: string;
  updatedAt: string;
  variant?: {
    id: string;
    productId: string;
    name: string;
    sku: string;
    barcode: string | null;
    price: string | number;
    costPrice: string | number | null;
    reorderLevel: number;
    product?: {
      id: string;
      name: string;
      slug: string;
      categoryId: string;
    };
  };
  warehouse?: {
    id: string;
    name: string;
    code: string;
    isDefault: boolean;
  };
}

export interface StockMovementEntity {
  id: string;
  variantId: string;
  warehouseId: string;
  type: StockMovementType;
  action: string | null;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  referenceType: string;
  referenceId: string;
  actorId: string | null;
  createdAt: string;
  variant?: {
    id: string;
    name: string;
    sku: string;
  };
  warehouse?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface InventorySummaryDto {
  totalProducts: number;
  totalStockUnits: number;
  available: number;
  reserved: number;
  damaged: number;
  stockValue?: string; // Visible only with inventory:view_cost
  damageValue?: string;
  netStockValue?: string;
}

export interface InventoryFilterQuery {
  page?: number;
  limit?: number;
  warehouseId?: string;
  categoryId?: string;
  search?: string;
  lowStockOnly?: boolean;
  outOfStockOnly?: boolean;
}

export interface StockMovementQueryFilter {
  page?: number;
  limit?: number;
  variantId?: string;
  warehouseId?: string;
  type?: StockMovementType;
  actorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReceiveStockInput {
  variantId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
  referenceType?: string;
  referenceId: string;
  unitCost?: number;
}

export interface AdjustStockInput {
  variantId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
}

export interface MarkDamagedInput {
  variantId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
}

export interface TransferStockInput {
  variantId: string;
  sourceWarehouseId: string;
  targetWarehouseId: string;
  quantity: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
}

export interface StockAuditItemEntity {
  id: string;
  auditId: string;
  variantId: string;
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  variant?: {
    id: string;
    sku: string;
    name: string;
  };
}

export interface StockAuditEntity {
  id: string;
  warehouseId: string;
  auditorId: string;
  status: 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  discrepanciesFound: number;
  notes: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  warehouse?: {
    id: string;
    name: string;
    code: string;
  };
  items?: StockAuditItemEntity[];
}

export interface StartAuditInput {
  warehouseId: string;
  notes?: string;
}

export interface AuditCountEntryInput {
  variantId: string;
  countedQuantity: number;
  notes?: string;
}

