'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchCoupons,
  fetchCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../api/coupons.api';
import type {
  CouponFilter,
  CreateCouponInput,
  UpdateCouponInput,
} from '../types/coupons.types';

export const couponsKeys = {
  all: ['coupons'] as const,
  lists: () => [...couponsKeys.all, 'list'] as const,
  list: (filter: CouponFilter) => [...couponsKeys.lists(), filter] as const,
  details: () => [...couponsKeys.all, 'detail'] as const,
  detail: (id: string) => [...couponsKeys.details(), id] as const,
};

export function useCouponsQuery(filter: CouponFilter = {}) {
  return useQuery({
    queryKey: couponsKeys.list(filter),
    queryFn: ({ signal }) => fetchCoupons(filter, signal),
  });
}

export function useCouponDetailQuery(id?: string) {
  return useQuery({
    queryKey: id ? couponsKeys.detail(id) : ['coupons', 'detail', 'none'],
    queryFn: ({ signal }) => {
      if (!id) throw new Error('Coupon ID is required');
      return fetchCouponById(id, signal);
    },
    enabled: Boolean(id),
  });
}

export function useCreateCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCouponInput) => createCoupon(input),
    onSuccess: (data) => {
      toast.success(`Coupon "${data.code}" created successfully`);
      queryClient.invalidateQueries({ queryKey: couponsKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create coupon';
      toast.error(msg);
    },
  });
}

export function useUpdateCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCouponInput }) =>
      updateCoupon(id, input),
    onSuccess: (data) => {
      toast.success(`Coupon "${data.code}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: couponsKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update coupon';
      toast.error(msg);
    },
  });
}

export function useDeleteCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => {
      toast.success('Coupon deleted successfully');
      queryClient.invalidateQueries({ queryKey: couponsKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to delete coupon';
      toast.error(msg);
    },
  });
}

