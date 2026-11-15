'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchActiveFlashSales,
  createFlashSale,
} from '../api/flash-sales.api';
import type { CreateFlashSaleInput } from '../types/flash-sales.types';

export const flashSalesKeys = {
  all: ['flash-sales'] as const,
  active: () => [...flashSalesKeys.all, 'active'] as const,
};

export function useActiveFlashSalesQuery() {
  return useQuery({
    queryKey: flashSalesKeys.active(),
    queryFn: ({ signal }) => fetchActiveFlashSales(signal),
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
