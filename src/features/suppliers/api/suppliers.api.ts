import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  CreateSupplierPayload,
  SupplierEntity,
  SupplierFilterQuery,
  UpdateSupplierPayload,
} from '../types/suppliers.types';

export async function fetchSuppliers(
  filter: SupplierFilterQuery = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<SupplierEntity[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page !== undefined) params.page = filter.page;
  if (filter.limit !== undefined) params.limit = filter.limit;
  if (filter.search) params.search = filter.search.trim();
  if (filter.isActive !== undefined) params.isActive = filter.isActive;

  return api.get<SupplierEntity[]>('/suppliers', { params, signal });
}

export async function fetchSupplierById(
  id: string,
  signal?: AbortSignal
): Promise<SupplierEntity> {
  const res = await api.get<SupplierEntity>(`/suppliers/${encodeURIComponent(id)}`, { signal });
  return res.data;
}

export async function createSupplier(payload: CreateSupplierPayload): Promise<SupplierEntity> {
  const res = await api.post<SupplierEntity>('/suppliers', payload);
  return res.data;
}

export async function updateSupplier(
  id: string,
  payload: UpdateSupplierPayload
): Promise<SupplierEntity> {
  const res = await api.patch<SupplierEntity>(`/suppliers/${encodeURIComponent(id)}`, payload);
  return res.data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await api.delete(`/suppliers/${encodeURIComponent(id)}`);
}

