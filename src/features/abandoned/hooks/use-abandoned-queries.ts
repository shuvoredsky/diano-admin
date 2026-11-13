import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAbandonedCheckouts,
  fetchAbandonedCheckoutById,
  triggerCheckoutRecovery,
} from '../api/abandoned.api';
import type {
  AbandonedCheckoutFilterQuery,
  RecoveryTriggerInput,
} from '../types/abandoned.types';

export const abandonedKeys = {
  all: ['abandoned-checkouts'] as const,
  lists: () => [...abandonedKeys.all, 'list'] as const,
  list: (filter: AbandonedCheckoutFilterQuery) => [...abandonedKeys.lists(), filter] as const,
  details: () => [...abandonedKeys.all, 'detail'] as const,
  detail: (id: string) => [...abandonedKeys.details(), id] as const,
};

export function useAbandonedCheckoutsQuery(filter: AbandonedCheckoutFilterQuery = {}) {
  return useQuery({
    queryKey: abandonedKeys.list(filter),
    queryFn: ({ signal }) => fetchAbandonedCheckouts(filter, signal),
  });
}

export function useAbandonedCheckoutDetailQuery(id?: string) {
  return useQuery({
    queryKey: abandonedKeys.detail(id || ''),
    queryFn: ({ signal }) => fetchAbandonedCheckoutById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useTriggerRecoveryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RecoveryTriggerInput }) =>
      triggerCheckoutRecovery(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: abandonedKeys.all });
      queryClient.invalidateQueries({ queryKey: abandonedKeys.detail(variables.id) });
    },
  });
}
