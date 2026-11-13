import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPayments,
  fetchPaymentById,
  markCodPaymentCollected,
} from '../api/payments.api';
import type {
  ListPaymentsFilter,
  MarkCodCollectedInput,
} from '../types/payments.types';

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filter: ListPaymentsFilter) => [...paymentKeys.lists(), filter] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
};

export function usePaymentsQuery(filter: ListPaymentsFilter = {}) {
  return useQuery({
    queryKey: paymentKeys.list(filter),
    queryFn: ({ signal }) => fetchPayments(filter, signal),
  });
}

export function usePaymentDetailQuery(id?: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id || ''),
    queryFn: ({ signal }) => fetchPaymentById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useMarkCodCollectedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: MarkCodCollectedInput }) =>
      markCodPaymentCollected(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: paymentKeys.detail(data.id) });
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
