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

interface NestedData<T> {
  data?: T;
  meta?: Record<string, unknown>;
  pagination?: { total?: number; page?: number; limit?: number };
}

function unwrap<T>(payload: T | NestedData<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
}

export async function fetchStaffUsers(params?: StaffFilterParams): Promise<StaffListResult> {
  const queryParams: Record<string, string | number> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.role) queryParams.role = params.role;
  if (params?.status) queryParams.status = params.status;
  if (params?.search) queryParams.search = params.search;

  const res = await api.get<StaffUser[]>('/users', { params: queryParams });
  const rawData = res.data as unknown;

  const users: StaffUser[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as { data?: StaffUser[] })?.data)
      ? (rawData as { data?: StaffUser[] }).data!
      : [];

  const pagination =
    (res.meta?.pagination as { totalItems?: number; page?: number; limit?: number } | undefined) ||
    ((rawData as { meta?: { pagination?: { totalItems?: number; page?: number; limit?: number } } })?.meta?.pagination);

  const total = pagination?.totalItems ?? users.length;
  const page = pagination?.page ?? params?.page ?? 1;
  const limit = pagination?.limit ?? params?.limit ?? 20;

  return { users, total, page, limit };
}

export async function getStaffUserById(id: string): Promise<StaffUser> {
  const res = await api.get<StaffUser>(`/users/${id}`);
  return unwrap(res.data);
}

export async function createStaffUser(input: CreateStaffInput): Promise<StaffUser> {
  const res = await api.post<StaffUser>('/users', input);
  return unwrap(res.data);
}

export async function updateStaffUser(id: string, input: UpdateStaffInput): Promise<StaffUser> {
  const res = await api.patch<StaffUser>(`/users/${id}`, input);
  return unwrap(res.data);
}

export async function updateStaffStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<StaffUser> {
  const res = await api.patch<StaffUser>(`/users/${id}/status`, { status });
  return unwrap(res.data);
}

export async function deleteStaffUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function revokeStaffSessions(id: string): Promise<void> {
  await api.post(`/users/${id}/revoke-sessions`);
}
