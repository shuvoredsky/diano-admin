import { api } from '@/lib/api/browser-client';
import type {
  RoleSummaryItem,
  RoleDetailItem,
  CreateRoleInput,
  UpdateRoleInput,
  AssignPermissionsInput,
  PermissionItem,
} from '../types/roles.types';

export async function fetchRolesList(): Promise<RoleSummaryItem[]> {
  const res = await api.get<{
    success: boolean;
    data: RoleSummaryItem[];
  }>('/roles');
  return res.data.data ?? [];
}

export async function getRoleById(id: string): Promise<RoleDetailItem> {
  const res = await api.get<{
    success: boolean;
    data: RoleDetailItem;
  }>(`/roles/${id}`);
  return res.data.data;
}

export async function createRole(input: CreateRoleInput): Promise<RoleDetailItem> {
  const res = await api.post<{
    success: boolean;
    data: RoleDetailItem;
  }>('/roles', input);
  return res.data.data;
}

export async function updateRole(id: string, input: UpdateRoleInput): Promise<RoleDetailItem> {
  const res = await api.patch<{
    success: boolean;
    data: RoleDetailItem;
  }>(`/roles/${id}`, input);
  return res.data.data;
}

export async function deleteRole(id: string): Promise<void> {
  await api.delete(`/roles/${id}`);
}

export async function assignPermissionsToRole(
  id: string,
  input: AssignPermissionsInput
): Promise<RoleDetailItem> {
  const res = await api.put<{
    success: boolean;
    data: RoleDetailItem;
  }>(`/roles/${id}/permissions`, input);
  return res.data.data;
}

export async function fetchPermissionsCatalog(): Promise<Record<string, PermissionItem[]>> {
  const res = await api.get<{
    success: boolean;
    data: Record<string, PermissionItem[]> | PermissionItem[];
  }>('/permissions');

  // Backend permissions controller returns getGroupedPermissions() or array
  const raw = res.data.data;
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
