import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  CouponEntity,
  CreateCouponInput,
  UpdateCouponInput,
  CouponFilter,
} from '../types/coupons.types';

export async function fetchCoupons(
  filter: CouponFilter = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<CouponEntity[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page) params.page = filter.page;
  if (filter.limit) params.limit = filter.limit;
  if (filter.search) params.search = filter.search.trim();
  if (filter.type) params.type = filter.type;
  if (filter.isActive !== undefined) params.isActive = String(filter.isActive);

  return api.get<CouponEntity[]>('/admin/coupons', { params, signal });
}

export async function fetchCouponById(
  id: string,
  signal?: AbortSignal
): Promise<CouponEntity> {
  const res = await api.get<CouponEntity>(`/admin/coupons/${id}`, { signal });
  return res.data;
}

export async function createCoupon(
  input: CreateCouponInput
): Promise<CouponEntity> {
  const res = await api.post<CouponEntity>('/admin/coupons', input);
  return res.data;
}

export async function updateCoupon(
  id: string,
  input: UpdateCouponInput
): Promise<CouponEntity> {
  const res = await api.patch<CouponEntity>(`/admin/coupons/${id}`, input);
  return res.data;
}

export async function deleteCoupon(
  id: string
): Promise<ApiSuccessResponse<void>> {
  return api.delete<void>(`/admin/coupons/${id}`);
}
