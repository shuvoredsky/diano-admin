'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchActiveFlashSales,
  fetchFlashSaleById,
  createFlashSale,
  updateFlashSale,
  cancelFlashSale,
  deleteFlashSale,
} from '../api/flash-sales.api';
import type { CreateFlashSaleInput, UpdateFlashSaleInput } from '../types/flash-sales.types';

export const flashSalesKeys = {
  all: ['flash-sales'] as const,
  active: () => [...flashSalesKeys.all, 'active'] as const,
  detail: (id: string) => [...flashSalesKeys.all, 'detail', id] as const,
};

export function useActiveFlashSalesQuery() {
  return useQuery({
    queryKey: flashSalesKeys.active(),
    queryFn: ({ signal }) => fetchActiveFlashSales(signal),
  });
}

export function useFlashSaleDetailQuery(id: string) {
  return useQuery({
    queryKey: flashSalesKeys.detail(id),
    queryFn: ({ signal }) => fetchFlashSaleById(id, signal),
    enabled: Boolean(id),
  });
}

export function useCreateFlashSaleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFlashSaleInput) => createFlashSale(input),
    onSuccess: (data) => {
      toast.success(`Flash sale campaign "${data.title}" launched successfully`);
      queryClient.invalidateQueries({ queryKey: flashSalesKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to launch flash sale';
      toast.error(msg);
    },
  });
}

export function useUpdateFlashSaleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFlashSaleInput }) =>
      updateFlashSale(id, input),
    onSuccess: (data) => {
      toast.success(`Flash sale campaign "${data.title}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: flashSalesKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update flash sale';
      toast.error(msg);
    },
  });
}

export function useCancelFlashSaleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelFlashSale(id),
    onSuccess: (data) => {
      toast.success(`Flash sale campaign "${data.title}" cancelled successfully`);
      queryClient.invalidateQueries({ queryKey: flashSalesKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to cancel flash sale';
      toast.error(msg);
    },
  });
}

export function useDeleteFlashSaleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFlashSale(id),
    onSuccess: () => {
      toast.success('Flash sale campaign deleted successfully');
      queryClient.invalidateQueries({ queryKey: flashSalesKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to delete flash sale';
      toast.error(msg);
    },
  });
}


