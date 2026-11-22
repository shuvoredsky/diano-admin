import { api } from '@/lib/api/browser-client';
import type {
  FlashSaleEntity,
  CreateFlashSaleInput,
  UpdateFlashSaleInput,
} from '../types/flash-sales.types';

export async function fetchActiveFlashSales(
  signal?: AbortSignal
): Promise<FlashSaleEntity[]> {
  const res = await api.get<FlashSaleEntity[]>('/admin/flash-sales', { signal });
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchFlashSaleById(
  id: string,
  signal?: AbortSignal
): Promise<FlashSaleEntity> {
  const res = await api.get<FlashSaleEntity>(`/admin/flash-sales/${id}`, { signal });
  return res.data;
}

export async function createFlashSale(
  input: CreateFlashSaleInput
): Promise<FlashSaleEntity> {
  const res = await api.post<FlashSaleEntity>('/admin/flash-sales', input);
  return res.data;
}

export async function updateFlashSale(
  id: string,
  input: UpdateFlashSaleInput
): Promise<FlashSaleEntity> {
  const res = await api.patch<FlashSaleEntity>(`/admin/flash-sales/${id}`, input);
  return res.data;
}

export async function cancelFlashSale(
  id: string
): Promise<FlashSaleEntity> {
  const res = await api.post<FlashSaleEntity>(`/admin/flash-sales/${id}/cancel`);
  return res.data;
}

export async function deleteFlashSale(
  id: string
): Promise<void> {
  await api.delete(`/admin/flash-sales/${id}`);
}


