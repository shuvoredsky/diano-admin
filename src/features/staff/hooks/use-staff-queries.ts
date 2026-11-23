import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
    onSuccess: (data) => {
      toast.success(`Staff account for ${data?.name || 'user'} created successfully`);
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.listRoot() });
      queryClient.refetchQueries({ queryKey: STAFF_QUERY_KEYS.listRoot() });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create staff account');
    },
  });
}

export function useUpdateStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStaffInput }) =>
      updateStaffUser(id, input),
    onSuccess: (data, variables) => {
      toast.success(`Staff account ${data?.name ? `for ${data.name}` : ''} updated successfully`);
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.listRoot() });
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.detail(variables.id) });
      queryClient.refetchQueries({ queryKey: STAFF_QUERY_KEYS.listRoot() });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update staff account');
    },
  });
}

export function useUpdateStaffStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' }) =>
      updateStaffStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Staff status changed to ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.listRoot() });
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.detail(variables.id) });
      queryClient.refetchQueries({ queryKey: STAFF_QUERY_KEYS.listRoot() });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    },
  });
}

export function useDeleteStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStaffUser(id),
    onSuccess: () => {
      toast.success('Staff account deactivated');
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.listRoot() });
      queryClient.refetchQueries({ queryKey: STAFF_QUERY_KEYS.listRoot() });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate account');
    },
  });
}

export function useRevokeStaffSessionsMutation() {
  return useMutation({
    mutationFn: (id: string) => revokeStaffSessions(id),
    onSuccess: () => {
      toast.success('All active sessions revoked for this staff member');
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke sessions');
    },
  });
}
