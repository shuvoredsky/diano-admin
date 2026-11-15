import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRolesList,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionsToRole,
  fetchPermissionsCatalog,
} from '../api/roles.api';
import type {
  CreateRoleInput,
  UpdateRoleInput,
  AssignPermissionsInput,
} from '../types/roles.types';

export const ROLES_QUERY_KEYS = {
  list: ['roles', 'list'] as const,
  detail: (id: string) => ['roles', 'detail', id] as const,
  permissionsCatalog: ['permissions', 'catalog'] as const,
};

export function useRolesListQuery() {
  return useQuery({
    queryKey: ROLES_QUERY_KEYS.list,
    queryFn: () => fetchRolesList(),
    staleTime: 60_000,
  });
}

export function useRoleDetailQuery(id?: string) {
  return useQuery({
    queryKey: ROLES_QUERY_KEYS.detail(id || ''),
    queryFn: () => getRoleById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function usePermissionsCatalogQuery() {
  return useQuery({
    queryKey: ROLES_QUERY_KEYS.permissionsCatalog,
    queryFn: () => fetchPermissionsCatalog(),
    staleTime: 5 * 60_000,
  });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoleInput) => createRole(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.list });
    },
  });
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoleInput }) =>
      updateRole(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.list });
    },
  });
}

export function useAssignPermissionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AssignPermissionsInput }) =>
      assignPermissionsToRole(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.detail(variables.id) });
    },
  });
}
