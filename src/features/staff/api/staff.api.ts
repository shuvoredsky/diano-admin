import { api } from '@/lib/api/browser-client';
import type {
  StaffUser,
  CreateStaffInput,
  UpdateStaffInput,
  StaffFilterParams,
} from '../types/staff.types';

export interface StaffListResult {
  users: StaffUser[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchStaffUsers(params?: StaffFilterParams): Promise<StaffListResult> {
  const queryParams: Record<string, string | number> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.role) queryParams.role = params.role;
  if (params?.status) queryParams.status = params.status;
  if (params?.search) queryParams.search = params.search;

  const res = await api.get<{
    success: boolean;
    data: StaffUser[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>('/users', { params: queryParams });

  return {
    users: res.data.data ?? [],
    total: res.data.pagination?.total ?? (res.data.data?.length ?? 0),
    page: res.data.pagination?.page ?? 1,
    limit: res.data.pagination?.limit ?? 20,
  };
}

export async function getStaffUserById(id: string): Promise<StaffUser> {
  const res = await api.get<{ success: boolean; data: StaffUser }>(`/users/${id}`);
  return res.data.data;
}

export async function createStaffUser(input: CreateStaffInput): Promise<StaffUser> {
  const res = await api.post<{ success: boolean; data: StaffUser }>('/users', input);
  return res.data.data;
}

export async function updateStaffUser(id: string, input: UpdateStaffInput): Promise<StaffUser> {
  const res = await api.patch<{ success: boolean; data: StaffUser }>(`/users/${id}`, input);
  return res.data.data;
}

export async function updateStaffStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<StaffUser> {
  const res = await api.patch<{ success: boolean; data: StaffUser }>(`/users/${id}/status`, { status });
  return res.data.data;
}

export async function deleteStaffUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function revokeStaffSessions(id: string): Promise<void> {
  await api.post(`/users/${id}/revoke-sessions`);
}
