import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  ReviewEntity,
  AdminReviewsFilter,
  UpdateReviewStatusInput,
} from '../types/reviews.types';

export async function fetchAdminReviews(
  filter: AdminReviewsFilter = {}
): Promise<ApiSuccessResponse<ReviewEntity[]>> {
  const params: Record<string, string | number> = {
    page: filter.page || 1,
    limit: filter.limit || 20,
  };

  if (filter.status) params.status = filter.status;
  if (filter.rating) params.rating = filter.rating;
  if (filter.productId) params.productId = filter.productId;
  if (filter.search) params.search = filter.search;

  const res = await api.get<ApiSuccessResponse<ReviewEntity[]>>('/admin/reviews', { params });
  return res.data;
}

export async function fetchAdminReviewById(id: string): Promise<ReviewEntity> {
  const res = await api.get<ReviewEntity>(`/admin/reviews/${id}`);
  return res.data;
}

export async function updateReviewStatus(
  id: string,
  input: UpdateReviewStatusInput
): Promise<ReviewEntity> {
  const res = await api.patch<ReviewEntity>(`/admin/reviews/${id}/status`, input);
  return res.data;
}

export async function deleteReview(id: string): Promise<void> {
  await api.delete(`/admin/reviews/${id}`);
}
