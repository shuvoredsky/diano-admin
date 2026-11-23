import { api } from '@/lib/api/browser-client';
import type {
  RoleSummaryItem,
  RoleDetailItem,
  CreateRoleInput,
  UpdateRoleInput,
  AssignPermissionsInput,
  PermissionItem,
} from '../types/roles.types';

interface NestedData<T> {
  data?: T;
}

function unwrap<T>(data: T | NestedData<T>): T {
  if (data && typeof data === 'object' && 'data' in data && (data as NestedData<T>).data !== undefined) {
    return (data as NestedData<T>).data as T;
  }
  return data as T;
}

export async function fetchRolesList(): Promise<RoleSummaryItem[]> {
  const res = await api.get<RoleSummaryItem[]>('/roles');
  const items = unwrap(res.data);
  return Array.isArray(items) ? items : [];
}

export async function getRoleById(id: string): Promise<RoleDetailItem> {
  const res = await api.get<RoleDetailItem>(`/roles/${id}`);
  return unwrap(res.data);
}

export async function createRole(input: CreateRoleInput): Promise<RoleDetailItem> {
  const res = await api.post<RoleDetailItem>('/roles', input);
  return unwrap(res.data);
}

export async function updateRole(id: string, input: UpdateRoleInput): Promise<RoleDetailItem> {
  const res = await api.patch<RoleDetailItem>(`/roles/${id}`, input);
  return unwrap(res.data);
}

export async function deleteRole(id: string): Promise<void> {
  await api.delete(`/roles/${id}`);
}

export async function assignPermissionsToRole(
  id: string,
  input: AssignPermissionsInput
): Promise<RoleDetailItem> {
  const res = await api.put<RoleDetailItem>(`/roles/${id}/permissions`, input);
  return unwrap(res.data);
}

export async function fetchPermissionsCatalog(): Promise<Record<string, PermissionItem[]>> {
  const res = await api.get<Record<string, PermissionItem[]> | PermissionItem[]>('/permissions');

  // Backend permissions controller returns getGroupedPermissions() or array
  const raw = unwrap(res.data);
  if (Array.isArray(raw)) {
    const grouped: Record<string, PermissionItem[]> = {};
    for (const p of raw) {
      const resource = p.resource || 'general';
      if (!grouped[resource]) grouped[resource] = [];
      grouped[resource].push(p);
    }
    return grouped;
  }
  return raw ?? {};
}
