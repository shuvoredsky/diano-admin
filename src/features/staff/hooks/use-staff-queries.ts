import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchStaffUsers,
  getStaffUserById,
  createStaffUser,
  updateStaffUser,
  updateStaffStatus,
  deleteStaffUser,
  revokeStaffSessions,
} from '../api/staff.api';
import type {
  StaffFilterParams,
  CreateStaffInput,
  UpdateStaffInput,
} from '../types/staff.types';

export const STAFF_QUERY_KEYS = {
  list: (params?: StaffFilterParams) => ['staff', 'list', params ?? {}] as const,
  listRoot: () => ['staff', 'list'] as const,
  detail: (id: string) => ['staff', 'detail', id] as const,
};

export function useStaffListQuery(params?: StaffFilterParams) {
  return useQuery({
    queryKey: STAFF_QUERY_KEYS.list(params),
    queryFn: () => fetchStaffUsers(params),
    staleTime: 30_000,
  });
}

export function useStaffDetailQuery(id?: string) {
  return useQuery({
    queryKey: STAFF_QUERY_KEYS.detail(id || ''),
    queryFn: () => getStaffUserById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCreateStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStaffInput) => createStaffUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.listRoot() });
    },
  });
}

export function useUpdateStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStaffInput }) =>
      updateStaffUser(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.listRoot() });
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useUpdateStaffStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' }) =>
      updateStaffStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.listRoot() });
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStaffUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.listRoot() });
    },
  });
}

export function useRevokeStaffSessionsMutation() {
  return useMutation({
    mutationFn: (id: string) => revokeStaffSessions(id),
  });
}
