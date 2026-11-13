import { api, browserApiClient } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  AddOrderNoteInput,
  CreateShipmentInput,
  OrderEntity,
  OrderFilterQuery,
  OrderNoteItem,
  OrderShipmentEntity,
  OrderStatusHistoryItem,
  UpdateOrderStatusInput,
  UpdateShipmentStatusInput,
} from '../types/orders.types';

export async function fetchAdminOrders(
  filter: OrderFilterQuery = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<OrderEntity[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page !== undefined) params.page = filter.page;
  if (filter.limit !== undefined) params.limit = filter.limit;
  if (filter.status) params.status = filter.status;
  if (filter.paymentStatus) params.paymentStatus = filter.paymentStatus;
  if (filter.dateFrom) params.dateFrom = filter.dateFrom;
  if (filter.dateTo) params.dateTo = filter.dateTo;
  if (filter.search) params.search = filter.search.trim();

  return api.get<OrderEntity[]>('/admin/orders', { params, signal });
}

export async function fetchAdminOrderById(
  id: string,
  signal?: AbortSignal
): Promise<OrderEntity> {
  const res = await api.get<OrderEntity>(`/admin/orders/${encodeURIComponent(id)}`, { signal });
  return res.data;
}

export async function updateAdminOrderStatus(
  id: string,
  input: UpdateOrderStatusInput
): Promise<OrderEntity> {
  const res = await api.patch<OrderEntity>(`/admin/orders/${encodeURIComponent(id)}/status`, input);
  return res.data;
}

export async function addAdminOrderNote(
  id: string,
  input: AddOrderNoteInput
): Promise<OrderNoteItem> {
  const res = await api.post<OrderNoteItem>(`/admin/orders/${encodeURIComponent(id)}/notes`, input);
  return res.data;
}

export async function fetchAdminOrderTimeline(
  id: string,
  signal?: AbortSignal
): Promise<OrderStatusHistoryItem[]> {
  const res = await api.get<OrderStatusHistoryItem[]>(
    `/admin/orders/${encodeURIComponent(id)}/timeline`,
    { signal }
  );
  return res.data;
}

export async function downloadAdminOrderInvoiceBlob(
  id: string,
  orderNumber?: string,
  signal?: AbortSignal
): Promise<{ blob: Blob; filename: string }> {
  try {
    const res = await browserApiClient.get<Blob>(`/admin/orders/${encodeURIComponent(id)}/invoice`, {
      responseType: 'blob',
      signal,
    });

    if (res.data.type === 'application/json') {
      const text = await res.data.text();
      let errorMsg = 'Failed to download invoice';
      try {
        const parsed = JSON.parse(text) as { message?: string; error?: string };
        if (parsed?.message) errorMsg = parsed.message;
        else if (parsed?.error) errorMsg = parsed.error;
      } catch {
        // Fall back to default errorMsg
      }
      throw new Error(errorMsg);
    }

    // Extract filename from Content-Disposition if present
    let filename = `Invoice-${orderNumber || id}.pdf`;
    const disposition = res.headers?.['content-disposition'] as string | undefined;
    if (disposition) {
      const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch?.[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '').trim();
      }
    }

    return { blob: res.data, filename };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'response' in err &&
      err.response &&
      typeof err.response === 'object' &&
      'data' in err.response &&
      err.response.data instanceof Blob
    ) {
      const blob = err.response.data as Blob;
      if (blob.type === 'application/json') {
        const text = await blob.text();
        let message = 'Invoice not available or failed to generate';
        try {
          const parsed = JSON.parse(text) as { message?: string; error?: string };
          if (parsed?.message) message = parsed.message;
          else if (parsed?.error) message = parsed.error;
        } catch {
          // Fall back to default message
        }
        throw new Error(message, { cause: err });
      }
    }
    throw err;
  }
}

export function saveBlobAsFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export async function fetchOrderShipment(
  orderId: string,
  signal?: AbortSignal
): Promise<OrderShipmentEntity> {
  const res = await api.get<OrderShipmentEntity>(
    `/admin/orders/${encodeURIComponent(orderId)}/shipments`,
    { signal }
  );
  return res.data;
}

export async function createOrderShipment(
  orderId: string,
  input: CreateShipmentInput
): Promise<OrderShipmentEntity> {
  const res = await api.post<OrderShipmentEntity>(
    `/admin/orders/${encodeURIComponent(orderId)}/shipments`,
    input
  );
  return res.data;
}

export async function updateOrderShipmentStatus(
  shipmentId: string,
  input: UpdateShipmentStatusInput
): Promise<OrderShipmentEntity> {
  const res = await api.patch<OrderShipmentEntity>(
    `/admin/orders/${encodeURIComponent(shipmentId)}/shipments/status`,
    input
  );
  return res.data;
}
