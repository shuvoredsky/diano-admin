import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  AbandonedCheckoutSessionItem,
  AbandonedCheckoutDetailResponse,
  AbandonedCheckoutFilterQuery,
  RecoveryTriggerInput,
  RecoveryTriggerResult,
} from '../types/abandoned.types';

export async function fetchAbandonedCheckouts(
  filter: AbandonedCheckoutFilterQuery = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<AbandonedCheckoutSessionItem[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page !== undefined) params.page = filter.page;
  if (filter.limit !== undefined) params.limit = filter.limit;
  if (filter.status) params.status = filter.status;
  if (filter.fromDate) params.fromDate = filter.fromDate;
  if (filter.toDate) params.toDate = filter.toDate;
  if (filter.minValue !== undefined) params.minValue = filter.minValue;
  if (filter.maxValue !== undefined) params.maxValue = filter.maxValue;

  return api.get<AbandonedCheckoutSessionItem[]>('/abandoned-checkouts', { params, signal });
}

export async function fetchAbandonedCheckoutById(
  id: string,
  signal?: AbortSignal
): Promise<AbandonedCheckoutDetailResponse> {
  const res = await api.get<AbandonedCheckoutDetailResponse>(
    `/abandoned-checkouts/${encodeURIComponent(id)}`,
    { signal }
  );
  return res.data;
}

export async function triggerCheckoutRecovery(
  id: string,
  input: RecoveryTriggerInput
): Promise<RecoveryTriggerResult> {
  const res = await api.post<RecoveryTriggerResult>(
    `/abandoned-checkouts/${encodeURIComponent(id)}/recovery`,
    input
  );
  return res.data;
}
