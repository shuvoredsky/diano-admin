import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  BannerEntity,
  CreateBannerInput,
  UpdateBannerInput,
  BannerFilterParams,
  BannerReorderItem,
} from '../types/banners.types';

export async function listBanners(params?: BannerFilterParams): Promise<ApiSuccessResponse<BannerEntity[]>> {
  const queryParams: Record<string, string | number> = {};
  if (params?.placement) queryParams.placement = params.placement;
  if (params?.isActive !== undefined && params.isActive !== '') queryParams.isActive = String(params.isActive);
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  const res = await api.get<ApiSuccessResponse<BannerEntity[]>>('/banners', { params: queryParams });
  return res.data;
}

export async function getBannerById(id: string): Promise<BannerEntity> {
  const res = await api.get<BannerEntity>(`/banners/${id}`);
  return res.data;
}

export async function createBanner(input: CreateBannerInput): Promise<BannerEntity> {
  const res = await api.post<BannerEntity>('/banners', input);
  return res.data;
}

export async function updateBanner(id: string, input: UpdateBannerInput): Promise<BannerEntity> {
  const res = await api.put<BannerEntity>(`/banners/${id}`, input);
  return res.data;
}

export async function toggleBannerActive(id: string): Promise<BannerEntity> {
  const res = await api.patch<BannerEntity>(`/banners/${id}/toggle`);
  return res.data;
}

export async function deleteBanner(id: string): Promise<void> {
  await api.delete(`/banners/${id}`);
}

export async function reorderBanners(items: BannerReorderItem[]): Promise<void> {
  await api.put('/banners/reorder', { items });
}
