import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  CreatePurchaseOrderPayload,
  PurchaseOrderEntity,
  PurchaseOrderFilterQuery,
  PurchaseOrderStatus,
  ReceivePurchaseOrderPayload,
} from '../types/purchases.types';

export async function fetchPurchaseOrders(
  filter: PurchaseOrderFilterQuery = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<PurchaseOrderEntity[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page !== undefined) params.page = filter.page;
  if (filter.limit !== undefined) params.limit = filter.limit;
  if (filter.status) params.status = filter.status;
  if (filter.supplierId) params.supplierId = filter.supplierId;
  if (filter.warehouseId) params.warehouseId = filter.warehouseId;
  if (filter.variantId) params.variantId = filter.variantId;
  if (filter.startDate) params.startDate = filter.startDate;
  if (filter.endDate) params.endDate = filter.endDate;

  return api.get<PurchaseOrderEntity[]>('/purchase-orders', { params, signal });
}

export async function fetchPurchaseOrderById(
  id: string,
  signal?: AbortSignal
): Promise<PurchaseOrderEntity> {
  const res = await api.get<PurchaseOrderEntity>(`/purchase-orders/${encodeURIComponent(id)}`, {
    signal,
  });
  return res.data;
}

export async function createPurchaseOrder(
  payload: CreatePurchaseOrderPayload
): Promise<PurchaseOrderEntity> {
  const res = await api.post<PurchaseOrderEntity>('/purchase-orders', payload);
  return res.data;
}

export async function updatePurchaseOrderStatus(
  id: string,
  status: PurchaseOrderStatus
): Promise<PurchaseOrderEntity> {
  const res = await api.patch<PurchaseOrderEntity>(
    `/purchase-orders/${encodeURIComponent(id)}/status`,
    { status }
  );
  return res.data;
}

export async function receivePurchaseOrderItems(
  id: string,
  payload: ReceivePurchaseOrderPayload
): Promise<PurchaseOrderEntity> {
  const res = await api.post<PurchaseOrderEntity>(
    `/purchase-orders/${encodeURIComponent(id)}/receive`,
    payload
  );
  return res.data;
}

