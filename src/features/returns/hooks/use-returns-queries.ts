'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchReturns,
  fetchReturnById,
  reviewReturn,
  receiveAndInspectReturn,
} from '../api/returns.api';
import type {
  ReturnFilter,
  ReviewReturnInput,
  ReceiveReturnInput,
} from '../types/returns.types';

export const returnsKeys = {
  all: ['returns'] as const,
  lists: () => [...returnsKeys.all, 'list'] as const,
  list: (filter: ReturnFilter) => [...returnsKeys.lists(), filter] as const,
  details: () => [...returnsKeys.all, 'detail'] as const,
  detail: (id: string) => [...returnsKeys.details(), id] as const,
};

export function useReturnsQuery(filter: ReturnFilter = {}) {
  return useQuery({
    queryKey: returnsKeys.list(filter),
    queryFn: ({ signal }) => fetchReturns(filter, signal),
  });
}

export function useReturnDetailQuery(id?: string) {
  return useQuery({
    queryKey: id ? returnsKeys.detail(id) : ['returns', 'detail', 'none'],
    queryFn: ({ signal }) => {
      if (!id) throw new Error('Return ID is required');
      return fetchReturnById(id, signal);
    },
    enabled: Boolean(id),
  });
}

export function useReviewReturnMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewReturnInput }) =>
      reviewReturn(id, input),
    onSuccess: (ret) => {
      const verb = ret.status === 'APPROVED' ? 'approved' : 'rejected';
      toast.success(`Return request #${ret.returnNumber} ${verb} successfully`);
      queryClient.invalidateQueries({ queryKey: returnsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to process return review';
      toast.error(msg);
    },
  });
}

export function useReceiveReturnMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReceiveReturnInput }) =>
      receiveAndInspectReturn(id, input),
    onSuccess: (ret) => {
      toast.success(`Return items inspected and processed successfully (Status: ${ret.status})`);
      queryClient.invalidateQueries({ queryKey: returnsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to inspect and receive return items';
      toast.error(msg);
    },
  });
}

