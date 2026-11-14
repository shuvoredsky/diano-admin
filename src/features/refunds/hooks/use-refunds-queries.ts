'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchRefunds,
  fetchRefundById,
  executeOrderRefund,
  executeReturnRefund,
} from '../api/refunds.api';
import type {
  RefundFilter,
  ExecuteOrderRefundInput,
  ExecuteReturnRefundInput,
} from '../types/refunds.types';

export const refundsKeys = {
  all: ['refunds'] as const,
  lists: () => [...refundsKeys.all, 'list'] as const,
  list: (filter: RefundFilter) => [...refundsKeys.lists(), filter] as const,
  details: () => [...refundsKeys.all, 'detail'] as const,
  detail: (id: string) => [...refundsKeys.details(), id] as const,
};

export function useRefundsQuery(filter: RefundFilter = {}) {
  return useQuery({
    queryKey: refundsKeys.list(filter),
    queryFn: ({ signal }) => fetchRefunds(filter, signal),
  });
}

export function useRefundDetailQuery(id?: string) {
  return useQuery({
    queryKey: id ? refundsKeys.detail(id) : ['refunds', 'detail', 'none'],
    queryFn: ({ signal }) => {
      if (!id) throw new Error('Refund ID is required');
      return fetchRefundById(id, signal);
    },
    enabled: Boolean(id),
  });
}

export function useExecuteOrderRefundMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, ...input }: ExecuteOrderRefundInput) =>
      executeOrderRefund(orderId, input),
    onSuccess: (refund) => {
      toast.success(`Refund of ${refund.amount} executed successfully (Status: ${refund.status})`);
      queryClient.invalidateQueries({ queryKey: refundsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to execute order refund';
      toast.error(msg);
    },
  });
}

export function useExecuteReturnRefundMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ returnRequestId, ...input }: ExecuteReturnRefundInput) =>
      executeReturnRefund(returnRequestId, input),
    onSuccess: (refund) => {
      toast.success(`Return refund of ${refund.amount} executed successfully (Status: ${refund.status})`);
      queryClient.invalidateQueries({ queryKey: refundsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to execute return refund';
      toast.error(msg);
    },
  });
}

