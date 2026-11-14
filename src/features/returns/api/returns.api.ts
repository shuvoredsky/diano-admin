import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  ReturnRequestEntity,
  ReturnFilter,
  ReviewReturnInput,
  ReceiveReturnInput,
} from '../types/returns.types';

export async function fetchReturns(
  filter: ReturnFilter = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<ReturnRequestEntity[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page !== undefined) params.page = filter.page;
  if (filter.limit !== undefined) params.limit = filter.limit;
  if (filter.status) params.status = filter.status;
  if (filter.orderId) params.orderId = filter.orderId.trim();
  if (filter.customerId) params.customerId = filter.customerId.trim();

  return api.get<ReturnRequestEntity[]>('/admin/returns', { params, signal });
}

export async function fetchReturnById(
  id: string,
  signal?: AbortSignal
): Promise<ReturnRequestEntity> {
  const res = await api.get<ReturnRequestEntity>(`/admin/returns/${encodeURIComponent(id)}`, {
    signal,
  });
  return res.data;
}

export async function reviewReturn(
  id: string,
  input: ReviewReturnInput
): Promise<ReturnRequestEntity> {
  const res = await api.post<ReturnRequestEntity>(
    `/admin/returns/${encodeURIComponent(id)}/review`,
    input
  );
  return res.data;
}

export async function receiveAndInspectReturn(
  id: string,
  input: ReceiveReturnInput
): Promise<ReturnRequestEntity> {
  const res = await api.post<ReturnRequestEntity>(
    `/admin/returns/${encodeURIComponent(id)}/receive`,
    input
  );
  return res.data;
}

