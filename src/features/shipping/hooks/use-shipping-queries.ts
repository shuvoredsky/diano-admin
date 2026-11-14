'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchShippingZones,
  fetchShippingZoneById,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
  fetchShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  fetchOrderShipments,
  createOrderShipment,
  updateShipmentStatus,
} from '../api/shipping.api';
import type {
  CreateShippingZoneInput,
  UpdateShippingZoneInput,
  CreateShippingMethodInput,
  UpdateShippingMethodInput,
  CreateOrderShipmentInput,
  UpdateShipmentStatusInput,
} from '../types/shipping.types';

export const shippingKeys = {
  all: ['shipping'] as const,
  zones: () => [...shippingKeys.all, 'zones'] as const,
  zone: (id: string) => [...shippingKeys.zones(), id] as const,
  methods: () => [...shippingKeys.all, 'methods'] as const,
  orderShipments: (orderId: string) => [...shippingKeys.all, 'orderShipments', orderId] as const,
};

export function useShippingZonesQuery() {
  return useQuery({
    queryKey: shippingKeys.zones(),
    queryFn: ({ signal }) => fetchShippingZones(signal),
  });
}

export function useShippingZoneDetailQuery(id?: string) {
  return useQuery({
    queryKey: id ? shippingKeys.zone(id) : ['shipping', 'zone', 'none'],
    queryFn: ({ signal }) => {
      if (!id) throw new Error('Zone ID is required');
      return fetchShippingZoneById(id, signal);
    },
    enabled: Boolean(id),
  });
}

export function useShippingMethodsQuery() {
  return useQuery({
    queryKey: shippingKeys.methods(),
    queryFn: ({ signal }) => fetchShippingMethods(signal),
  });
}

export function useOrderShipmentsQuery(orderId?: string) {
  return useQuery({
    queryKey: orderId ? shippingKeys.orderShipments(orderId) : ['shipping', 'orderShipments', 'none'],
    queryFn: ({ signal }) => {
      if (!orderId) throw new Error('Order ID is required');
      return fetchOrderShipments(orderId, signal);
    },
    enabled: Boolean(orderId),
  });
}

export function useCreateZoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateShippingZoneInput) => createShippingZone(input),
    onSuccess: (zone) => {
      toast.success(`Shipping zone "${zone.name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: shippingKeys.zones() });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create shipping zone';
      toast.error(msg);
    },
  });
}

export function useUpdateZoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateShippingZoneInput }) =>
      updateShippingZone(id, input),
    onSuccess: (zone) => {
      toast.success(`Shipping zone "${zone.name}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: shippingKeys.zones() });
      queryClient.invalidateQueries({ queryKey: shippingKeys.zone(zone.id) });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update shipping zone';
      toast.error(msg);
    },
  });
}

export function useDeleteZoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShippingZone(id),
    onSuccess: () => {
      toast.success('Shipping zone deleted successfully');
      queryClient.invalidateQueries({ queryKey: shippingKeys.zones() });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to delete shipping zone';
      toast.error(msg);
    },
  });
}

export function useCreateMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateShippingMethodInput) => createShippingMethod(input),
    onSuccess: (method) => {
      toast.success(`Shipping method "${method.name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: shippingKeys.methods() });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create shipping method';
      toast.error(msg);
    },
  });
}

export function useUpdateMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateShippingMethodInput }) =>
      updateShippingMethod(id, input),
    onSuccess: (method) => {
      toast.success(`Shipping method "${method.name}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: shippingKeys.methods() });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update shipping method';
      toast.error(msg);
    },
  });
}

export function useDeleteMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShippingMethod(id),
    onSuccess: () => {
      toast.success('Shipping method deleted successfully');
      queryClient.invalidateQueries({ queryKey: shippingKeys.methods() });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to delete shipping method';
      toast.error(msg);
    },
  });
}

export function useCreateShipmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: CreateOrderShipmentInput }) =>
      createOrderShipment(orderId, input),
    onSuccess: (_, variables) => {
      toast.success('Shipment created and assigned successfully');
      queryClient.invalidateQueries({ queryKey: shippingKeys.orderShipments(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create shipment';
      toast.error(msg);
    },
  });
}

export function useUpdateShipmentStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, input }: { shipmentId: string; orderId?: string; input: UpdateShipmentStatusInput }) =>
      updateShipmentStatus(shipmentId, input),
    onSuccess: (_, variables) => {
      toast.success(`Shipment status updated to ${variables.input.status}`);
      if (variables.orderId) {
        queryClient.invalidateQueries({ queryKey: shippingKeys.orderShipments(variables.orderId) });
      }
      queryClient.invalidateQueries({ queryKey: shippingKeys.all });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update shipment status';
      toast.error(msg);
    },
  });
}

