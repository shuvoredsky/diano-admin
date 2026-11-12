import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPurchaseOrder,
  fetchPurchaseOrderById,
  fetchPurchaseOrders,
  receivePurchaseOrderItems,
  updatePurchaseOrderStatus,
} from '../api/purchases.api';
import type {
  CreatePurchaseOrderPayload,
  PurchaseOrderFilterQuery,
  PurchaseOrderStatus,
  ReceivePurchaseOrderPayload,
} from '../types/purchases.types';

export const purchaseKeys = {
  all: ['purchase-orders'] as const,
  lists: () => [...purchaseKeys.all, 'list'] as const,
  list: (filter: PurchaseOrderFilterQuery) => [...purchaseKeys.lists(), filter] as const,
  details: () => [...purchaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseKeys.details(), id] as const,
};

export function usePurchaseOrdersQuery(filter: PurchaseOrderFilterQuery = {}) {
  return useQuery({
    queryKey: purchaseKeys.list(filter),
    queryFn: ({ signal }) => fetchPurchaseOrders(filter, signal),
  });
}

export function usePurchaseOrderByIdQuery(id?: string) {
  return useQuery({
    queryKey: purchaseKeys.detail(id || ''),
    queryFn: ({ signal }) => fetchPurchaseOrderById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCreatePurchaseOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePurchaseOrderPayload) => createPurchaseOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });
}

export function useUpdatePurchaseOrderStatusMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: PurchaseOrderStatus) => updatePurchaseOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
    },
  });
}

export function useReceivePurchaseOrderMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReceivePurchaseOrderPayload) =>
      receivePurchaseOrderItems(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
      // Crucial: Invalidate inventory and stock movements because stock was received!
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

