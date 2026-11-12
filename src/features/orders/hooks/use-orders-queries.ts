import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addAdminOrderNote,
  createOrderShipment,
  fetchAdminOrderById,
  fetchAdminOrders,
  fetchAdminOrderTimeline,
  fetchOrderShipment,
  updateAdminOrderStatus,
  updateOrderShipmentStatus,
} from '../api/orders.api';
import type {
  AddOrderNoteInput,
  CreateShipmentInput,
  OrderFilterQuery,
  UpdateOrderStatusInput,
  UpdateShipmentStatusInput,
} from '../types/orders.types';

export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: (filter: OrderFilterQuery) => [...ordersKeys.lists(), filter] as const,
  details: () => [...ordersKeys.all, 'detail'] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
  timeline: (id: string) => [...ordersKeys.all, 'timeline', id] as const,
  shipment: (orderId: string) => [...ordersKeys.all, 'shipment', orderId] as const,
};

export function useAdminOrdersQuery(filter: OrderFilterQuery = {}) {
  return useQuery({
    queryKey: ordersKeys.list(filter),
    queryFn: ({ signal }) => fetchAdminOrders(filter, signal),
  });
}

export function useAdminOrderByIdQuery(id?: string) {
  return useQuery({
    queryKey: ordersKeys.detail(id || ''),
    queryFn: ({ signal }) => fetchAdminOrderById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useAdminOrderTimelineQuery(id?: string) {
  return useQuery({
    queryKey: ordersKeys.timeline(id || ''),
    queryFn: ({ signal }) => fetchAdminOrderTimeline(id!, signal),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrderStatusInput }) =>
      updateAdminOrderStatus(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.all });
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.timeline(variables.id) });
    },
  });
}

export function useAddOrderNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddOrderNoteInput }) =>
      addAdminOrderNote(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(variables.id) });
    },
  });
}

export function useOrderShipmentQuery(orderId?: string) {
  return useQuery({
    queryKey: ordersKeys.shipment(orderId || ''),
    queryFn: ({ signal }) => fetchOrderShipment(orderId!, signal),
    enabled: Boolean(orderId),
  });
}

export function useCreateOrderShipmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: CreateShipmentInput }) =>
      createOrderShipment(orderId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.shipment(variables.orderId) });
    },
  });
}

export function useUpdateOrderShipmentStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      input,
    }: {
      shipmentId: string;
      orderId: string;
      input: UpdateShipmentStatusInput;
    }) => updateOrderShipmentStatus(shipmentId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.shipment(variables.orderId) });
    },
  });
}
