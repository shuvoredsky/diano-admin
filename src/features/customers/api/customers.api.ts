import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  CustomerListItem,
  CustomerDetailAdminView,
  CustomerQueryFilter,
  CustomerNoteItem,
  CustomerTimelineItem,
  UpdateCustomerStatusInput,
  AddCustomerNoteInput,
} from '../types/customers.types';

export async function fetchCustomers(
  filter: CustomerQueryFilter = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<CustomerListItem[]>> {
  const params: Record<string, unknown> = {};
  if (filter.page !== undefined) params.page = filter.page;
  if (filter.limit !== undefined) params.limit = filter.limit;
  if (filter.search) params.search = filter.search.trim();
  if (filter.status) params.status = filter.status;
  if (filter.sortBy) params.sortBy = filter.sortBy;
  if (filter.sortOrder) params.sortOrder = filter.sortOrder;

  return api.get<CustomerListItem[]>('/customers', { params, signal });
}

export async function fetchCustomerById(
  id: string,
  signal?: AbortSignal
): Promise<CustomerDetailAdminView> {
  const res = await api.get<CustomerDetailAdminView>(`/customers/${encodeURIComponent(id)}`, {
    signal,
  });
  return res.data;
}

export async function updateCustomerStatus(
  id: string,
  input: UpdateCustomerStatusInput
): Promise<CustomerDetailAdminView> {
  const res = await api.patch<CustomerDetailAdminView>(
    `/customers/${encodeURIComponent(id)}/status`,
    input
  );
  return res.data;
}

export async function addCustomerNote(
  id: string,
  input: AddCustomerNoteInput
): Promise<CustomerNoteItem> {
  const res = await api.post<CustomerNoteItem>(
    `/customers/${encodeURIComponent(id)}/notes`,
    input
  );
  return res.data;
}

export async function fetchCustomerNotes(
  id: string,
  signal?: AbortSignal
): Promise<CustomerNoteItem[]> {
  const res = await api.get<CustomerNoteItem[]>(
    `/customers/${encodeURIComponent(id)}/notes`,
    { signal }
  );
  return res.data;
}

export async function fetchCustomerTimeline(
  id: string,
  signal?: AbortSignal
): Promise<CustomerTimelineItem[]> {
  const res = await api.get<CustomerTimelineItem[]>(
    `/customers/${encodeURIComponent(id)}/timeline`,
    { signal }
  );
  return res.data;
}
