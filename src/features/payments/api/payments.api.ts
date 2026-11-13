import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  ListPaymentsFilter,
  MarkCodCollectedInput,
  PaymentDetailEntity,
  PaymentListItem,
} from '../types/payments.types';

export async function fetchPayments(
  filter: ListPaymentsFilter = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<PaymentListItem[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page !== undefined) params.page = filter.page;
  if (filter.limit !== undefined) params.limit = filter.limit;
  if (filter.provider) params.provider = filter.provider;
  if (filter.status) params.status = filter.status;
  if (filter.orderId) params.orderId = filter.orderId.trim();
  if (filter.startDate) params.startDate = filter.startDate;
  if (filter.endDate) params.endDate = filter.endDate;

  return api.get<PaymentListItem[]>('/admin/payments', { params, signal });
}

export async function fetchPaymentById(
  id: string,
  signal?: AbortSignal
): Promise<PaymentDetailEntity> {
  const res = await api.get<PaymentDetailEntity>(`/admin/payments/${encodeURIComponent(id)}`, {
    signal,
  });
  return res.data;
}

export async function markCodPaymentCollected(
  id: string,
  input: MarkCodCollectedInput = {}
): Promise<PaymentDetailEntity> {
  const res = await api.post<PaymentDetailEntity>(
    `/admin/payments/${encodeURIComponent(id)}/mark-cod-collected`,
    input
  );
  return res.data;
}
