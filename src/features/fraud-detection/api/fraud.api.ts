import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  ApproveFraudReviewInput,
  FraudReviewDetailEntity,
  FraudReviewListItem,
  FraudStats,
  ListFraudReviewsFilter,
  RejectFraudReviewInput,
  StoredFraudRule,
  UpdateFraudRuleInput,
  VerifyFraudOtpInput,
} from '../types/fraud.types';

export async function fetchFraudRules(signal?: AbortSignal): Promise<StoredFraudRule[]> {
  const res = await api.get<StoredFraudRule[]>('/admin/fraud/rules', { signal });
  return res.data;
}

export async function updateFraudRule(
  key: string,
  input: UpdateFraudRuleInput
): Promise<StoredFraudRule> {
  const res = await api.patch<StoredFraudRule>(
    `/admin/fraud/rules/${encodeURIComponent(key)}`,
    input
  );
  return res.data;
}

export async function fetchFraudStats(signal?: AbortSignal): Promise<FraudStats> {
  const res = await api.get<FraudStats>('/admin/fraud/stats', { signal });
  return res.data;
}

export async function fetchFraudReviews(
  filter: ListFraudReviewsFilter = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<FraudReviewListItem[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page !== undefined) params.page = filter.page;
  if (filter.limit !== undefined) params.limit = filter.limit;
  if (filter.status) params.status = filter.status;
  if (filter.riskLevel) params.riskLevel = filter.riskLevel;
  if (filter.dateFrom) params.dateFrom = filter.dateFrom;
  if (filter.dateTo) params.dateTo = filter.dateTo;

  return api.get<FraudReviewListItem[]>('/admin/fraud/reviews', { params, signal });
}

export async function fetchFraudReviewById(
  id: string,
  signal?: AbortSignal
): Promise<FraudReviewDetailEntity> {
  const res = await api.get<FraudReviewDetailEntity>(
    `/admin/fraud/reviews/${encodeURIComponent(id)}`,
    { signal }
  );
  return res.data;
}

export async function approveFraudReview(
  id: string,
  input: ApproveFraudReviewInput = {}
): Promise<FraudReviewDetailEntity> {
  const res = await api.post<FraudReviewDetailEntity>(
    `/admin/fraud/reviews/${encodeURIComponent(id)}/approve`,
    input
  );
  return res.data;
}

export async function rejectFraudReview(
  id: string,
  input: RejectFraudReviewInput
): Promise<FraudReviewDetailEntity> {
  const res = await api.post<FraudReviewDetailEntity>(
    `/admin/fraud/reviews/${encodeURIComponent(id)}/reject`,
    input
  );
  return res.data;
}

export async function requestFraudOtp(
  id: string
): Promise<{ message: string; orderId: string; phone: string; expiresAt: string }> {
  const res = await api.post<{
    message: string;
    orderId: string;
    phone: string;
    expiresAt: string;
  }>(`/admin/fraud/reviews/${encodeURIComponent(id)}/request-otp`);
  return res.data;
}

export async function verifyFraudOtp(
  id: string,
  input: VerifyFraudOtpInput
): Promise<FraudReviewDetailEntity> {
  const res = await api.post<FraudReviewDetailEntity>(
    `/admin/fraud/reviews/${encodeURIComponent(id)}/verify-otp`,
    input
  );
  return res.data;
}
