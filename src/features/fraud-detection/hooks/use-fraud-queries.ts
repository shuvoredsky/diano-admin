import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchFraudRules,
  updateFraudRule,
  fetchFraudStats,
  fetchFraudReviews,
  fetchFraudReviewById,
  approveFraudReview,
  rejectFraudReview,
  requestFraudOtp,
  verifyFraudOtp,
} from '../api/fraud.api';
import type {
  ApproveFraudReviewInput,
  ListFraudReviewsFilter,
  RejectFraudReviewInput,
  UpdateFraudRuleInput,
  VerifyFraudOtpInput,
} from '../types/fraud.types';

export const fraudKeys = {
  all: ['fraud'] as const,
  rules: () => [...fraudKeys.all, 'rules'] as const,
  stats: () => [...fraudKeys.all, 'stats'] as const,
  reviews: () => [...fraudKeys.all, 'reviews'] as const,
  reviewList: (filter: ListFraudReviewsFilter) =>
    [...fraudKeys.reviews(), 'list', filter] as const,
  reviewDetail: (id: string) => [...fraudKeys.reviews(), 'detail', id] as const,
};

export function useFraudRulesQuery() {
  return useQuery({
    queryKey: fraudKeys.rules(),
    queryFn: ({ signal }) => fetchFraudRules(signal),
  });
}

export function useUpdateFraudRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: UpdateFraudRuleInput }) =>
      updateFraudRule(key, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fraudKeys.rules() });
    },
  });
}

export function useFraudStatsQuery() {
  return useQuery({
    queryKey: fraudKeys.stats(),
    queryFn: ({ signal }) => fetchFraudStats(signal),
  });
}

export function useFraudReviewsQuery(filter: ListFraudReviewsFilter = {}) {
  return useQuery({
    queryKey: fraudKeys.reviewList(filter),
    queryFn: ({ signal }) => fetchFraudReviews(filter, signal),
  });
}

export function useFraudReviewDetailQuery(id?: string) {
  return useQuery({
    queryKey: fraudKeys.reviewDetail(id || ''),
    queryFn: ({ signal }) => fetchFraudReviewById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useApproveFraudReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: ApproveFraudReviewInput }) =>
      approveFraudReview(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fraudKeys.all });
      if (data?.order?.id) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    },
  });
}

export function useRejectFraudReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RejectFraudReviewInput }) =>
      rejectFraudReview(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fraudKeys.all });
      if (data?.order?.id) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    },
  });
}

export function useRequestFraudOtpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestFraudOtp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fraudKeys.reviews() });
    },
  });
}

export function useVerifyFraudOtpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VerifyFraudOtpInput }) =>
      verifyFraudOtp(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fraudKeys.all });
      if (data?.order?.id) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    },
  });
}
