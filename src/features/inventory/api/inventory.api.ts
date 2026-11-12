import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  AdjustStockInput,
  AuditCountEntryInput,
  InventoryEntity,
  InventoryFilterQuery,
  InventorySummaryDto,
  MarkDamagedInput,
  ReceiveStockInput,
  StartAuditInput,
  StockAuditEntity,
  StockMovementEntity,
  StockMovementQueryFilter,
  TransferStockInput,
} from '../types/inventory.types';

export async function fetchInventorySummary(signal?: AbortSignal): Promise<InventorySummaryDto> {
  const res = await api.get<InventorySummaryDto>('/inventory/summary', { signal });
  return res.data;
}

export async function fetchInventoryList(
  filter: InventoryFilterQuery = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<InventoryEntity[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page !== undefined) params.page = filter.page;
  if (filter.limit !== undefined) params.limit = filter.limit;
  if (filter.warehouseId) params.warehouseId = filter.warehouseId;
  if (filter.categoryId) params.categoryId = filter.categoryId;
  if (filter.search) params.search = filter.search.trim();
  if (filter.lowStockOnly !== undefined) params.lowStockOnly = filter.lowStockOnly;
  if (filter.outOfStockOnly !== undefined) params.outOfStockOnly = filter.outOfStockOnly;

  return api.get<InventoryEntity[]>('/inventory', { params, signal });
}

export async function fetchLowStockList(
  filter: InventoryFilterQuery = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<InventoryEntity[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page !== undefined) params.page = filter.page;
  if (filter.limit !== undefined) params.limit = filter.limit;
  if (filter.warehouseId) params.warehouseId = filter.warehouseId;
  if (filter.categoryId) params.categoryId = filter.categoryId;

  return api.get<InventoryEntity[]>('/inventory/low-stock', { params, signal });
}

export async function fetchStockMovements(
  filter: StockMovementQueryFilter = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<StockMovementEntity[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page !== undefined) params.page = filter.page;
  if (filter.limit !== undefined) params.limit = filter.limit;
  if (filter.variantId) params.variantId = filter.variantId;
  if (filter.warehouseId) params.warehouseId = filter.warehouseId;
  if (filter.type) params.type = filter.type;
  if (filter.actorId) params.actorId = filter.actorId;
  if (filter.startDate) params.startDate = filter.startDate;
  if (filter.endDate) params.endDate = filter.endDate;

  return api.get<StockMovementEntity[]>('/inventory/movements', { params, signal });
}

export async function adjustStock(input: AdjustStockInput): Promise<{ inventory: InventoryEntity; movement: StockMovementEntity }> {
  const res = await api.post<{ inventory: InventoryEntity; movement: StockMovementEntity }>('/inventory/adjust', input);
  return res.data;
}

export async function markStockDamaged(input: MarkDamagedInput): Promise<{ inventory: InventoryEntity; movement: StockMovementEntity }> {
  const res = await api.post<{ inventory: InventoryEntity; movement: StockMovementEntity }>('/inventory/damage', input);
  return res.data;
}

export async function receiveStock(input: ReceiveStockInput): Promise<{ inventory: InventoryEntity; movement: StockMovementEntity }> {
  const res = await api.post<{ inventory: InventoryEntity; movement: StockMovementEntity }>('/inventory/receive', input);
  return res.data;
}

export async function transferStock(input: TransferStockInput): Promise<{
  sourceInventory: InventoryEntity;
  targetInventory: InventoryEntity;
  outboundMovement: StockMovementEntity;
  inboundMovement: StockMovementEntity;
}> {
  const res = await api.post<{
    sourceInventory: InventoryEntity;
    targetInventory: InventoryEntity;
    outboundMovement: StockMovementEntity;
    inboundMovement: StockMovementEntity;
  }>('/inventory/transfer', input);
  return res.data;
}

// ================= Stock Audits =================

export async function fetchStockAudits(
  warehouseId?: string,
  signal?: AbortSignal
): Promise<StockAuditEntity[]> {
  const res = await api.get<StockAuditEntity[]>('/inventory/audits', {
    params: warehouseId ? { warehouseId } : undefined,
    signal,
  });
  return res.data;
}

export async function fetchStockAuditById(
  id: string,
  signal?: AbortSignal
): Promise<StockAuditEntity> {
  const res = await api.get<StockAuditEntity>(`/inventory/audits/${encodeURIComponent(id)}`, { signal });
  return res.data;
}

export async function startStockAudit(input: StartAuditInput): Promise<StockAuditEntity> {
  const res = await api.post<StockAuditEntity>('/inventory/audits', input);
  return res.data;
}

export async function recordAuditCounts(
  auditId: string,
  items: AuditCountEntryInput[]
): Promise<StockAuditEntity> {
  const res = await api.post<StockAuditEntity>(
    `/inventory/audits/${encodeURIComponent(auditId)}/counts`,
    { items }
  );
  return res.data;
}

export async function approveStockAudit(auditId: string): Promise<StockAuditEntity> {
  const res = await api.post<StockAuditEntity>(
    `/inventory/audits/${encodeURIComponent(auditId)}/approve`
  );
  return res.data;
}

export async function rejectStockAudit(
  auditId: string,
  reason?: string
): Promise<StockAuditEntity> {
  const res = await api.post<StockAuditEntity>(
    `/inventory/audits/${encodeURIComponent(auditId)}/reject`,
    { reason }
  );
  return res.data;
}

