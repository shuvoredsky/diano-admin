import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  RefundEntity,
  RefundFilter,
  ExecuteOrderRefundInput,
  ExecuteReturnRefundInput,
} from '../types/refunds.types';

export async function fetchRefunds(
  filter: RefundFilter = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<RefundEntity[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page !== undefined) params.page = filter.page;
  if (filter.limit !== undefined) params.limit = filter.limit;
  if (filter.status) params.status = filter.status;
  if (filter.orderId) params.orderId = filter.orderId.trim();
  if (filter.paymentId) params.paymentId = filter.paymentId.trim();

  return api.get<RefundEntity[]>('/admin/refunds', { params, signal });
}

export async function fetchRefundById(
  id: string,
  signal?: AbortSignal
): Promise<RefundEntity> {
  const res = await api.get<RefundEntity>(`/admin/refunds/${encodeURIComponent(id)}`, {
    signal,
  });
  return res.data;
}

export async function executeOrderRefund(
  orderId: string,
  input: Omit<ExecuteOrderRefundInput, 'orderId'>
): Promise<RefundEntity> {
  const res = await api.post<RefundEntity>(
    `/admin/refunds/orders/${encodeURIComponent(orderId)}/refunds`,
    input
  );
  return res.data;
}

export async function executeReturnRefund(
  returnRequestId: string,
  input: Omit<ExecuteReturnRefundInput, 'returnRequestId'>
): Promise<RefundEntity> {
  const res = await api.post<RefundEntity>(
    `/admin/refunds/returns/${encodeURIComponent(returnRequestId)}/refund`,
    input
  );
  return res.data;
}

