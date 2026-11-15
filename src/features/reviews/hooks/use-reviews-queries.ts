import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminReviews,
  fetchAdminReviewById,
  updateReviewStatus,
  deleteReview,
} from '../api/reviews.api';
import type { AdminReviewsFilter, UpdateReviewStatusInput } from '../types/reviews.types';

export const REVIEWS_QUERY_KEY = ['reviews'] as const;

export function useAdminReviewsQuery(filter: AdminReviewsFilter) {
  return useQuery({
    queryKey: [...REVIEWS_QUERY_KEY, 'list', filter],
    queryFn: () => fetchAdminReviews(filter),
    staleTime: 30_000,
  });
}

export function useAdminReviewDetailQuery(id?: string) {
  return useQuery({
    queryKey: [...REVIEWS_QUERY_KEY, 'detail', id],
    queryFn: () => fetchAdminReviewById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useUpdateReviewStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReviewStatusInput }) =>
      updateReviewStatus(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY });
    },
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY });
    },
  });
}
