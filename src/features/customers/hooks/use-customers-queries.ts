import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCustomers,
  fetchCustomerById,
  updateCustomerStatus,
  addCustomerNote,
  fetchCustomerNotes,
  fetchCustomerTimeline,
} from '../api/customers.api';
import type {
  CustomerQueryFilter,
  UpdateCustomerStatusInput,
  AddCustomerNoteInput,
} from '../types/customers.types';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filter: CustomerQueryFilter) => [...customerKeys.lists(), filter] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  notes: (id: string) => [...customerKeys.all, 'notes', id] as const,
  timeline: (id: string) => [...customerKeys.all, 'timeline', id] as const,
};

export function useCustomersQuery(filter: CustomerQueryFilter = {}) {
  return useQuery({
    queryKey: customerKeys.list(filter),
    queryFn: ({ signal }) => fetchCustomers(filter, signal),
  });
}

export function useCustomerDetailQuery(id?: string) {
  return useQuery({
    queryKey: customerKeys.detail(id || ''),
    queryFn: ({ signal }) => fetchCustomerById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCustomerNotesQuery(id?: string) {
  return useQuery({
    queryKey: customerKeys.notes(id || ''),
    queryFn: ({ signal }) => fetchCustomerNotes(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCustomerTimelineQuery(id?: string) {
  return useQuery({
    queryKey: customerKeys.timeline(id || ''),
    queryFn: ({ signal }) => fetchCustomerTimeline(id!, signal),
    enabled: Boolean(id),
  });
}

export function useUpdateCustomerStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerStatusInput }) =>
      updateCustomerStatus(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.timeline(variables.id) });
    },
  });
}

export function useAddCustomerNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddCustomerNoteInput }) =>
      addCustomerNote(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.notes(variables.id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.timeline(variables.id) });
    },
  });
}
