import { api } from '@/lib/api/browser-client';
import type {
  FlashSaleEntity,
  CreateFlashSaleInput,
} from '../types/flash-sales.types';

export async function fetchActiveFlashSales(
  signal?: AbortSignal
): Promise<FlashSaleEntity[]> {
  const res = await api.get<FlashSaleEntity[]>('/flash-sales', { signal });
  return res.data;
}

export async function createFlashSale(
  input: CreateFlashSaleInput
): Promise<FlashSaleEntity> {
  const res = await api.post<FlashSaleEntity>('/admin/flash-sales', input);
  return res.data;
}

