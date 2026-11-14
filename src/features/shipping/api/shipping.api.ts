import { api } from '@/lib/api/browser-client';
import type {
  ShippingZoneEntity,
  CreateShippingZoneInput,
  UpdateShippingZoneInput,
  ShippingMethodEntity,
  CreateShippingMethodInput,
  UpdateShippingMethodInput,
  ShipmentEntity,
  CreateOrderShipmentInput,
  UpdateShipmentStatusInput,
} from '../types/shipping.types';

// Zones
export async function fetchShippingZones(signal?: AbortSignal): Promise<ShippingZoneEntity[]> {
  const res = await api.get<ShippingZoneEntity[]>('/admin/shipping/zones', { signal });
  return res.data;
}

export async function fetchShippingZoneById(id: string, signal?: AbortSignal): Promise<ShippingZoneEntity> {
  const res = await api.get<ShippingZoneEntity>(`/admin/shipping/zones/${encodeURIComponent(id)}`, { signal });
  return res.data;
}

export async function createShippingZone(input: CreateShippingZoneInput): Promise<ShippingZoneEntity> {
  const res = await api.post<ShippingZoneEntity>('/admin/shipping/zones', input);
  return res.data;
}

export async function updateShippingZone(id: string, input: UpdateShippingZoneInput): Promise<ShippingZoneEntity> {
  const res = await api.patch<ShippingZoneEntity>(`/admin/shipping/zones/${encodeURIComponent(id)}`, input);
  return res.data;
}

export async function deleteShippingZone(id: string): Promise<{ success: boolean; message: string }> {
  const res = await api.delete<{ success: boolean; message: string }>(
    `/admin/shipping/zones/${encodeURIComponent(id)}`
  );
  return res.data;
}

// Methods
export async function fetchShippingMethods(signal?: AbortSignal): Promise<ShippingMethodEntity[]> {
  const res = await api.get<ShippingMethodEntity[]>('/admin/shipping/methods', { signal });
  return res.data;
}

export async function createShippingMethod(input: CreateShippingMethodInput): Promise<ShippingMethodEntity> {
  const res = await api.post<ShippingMethodEntity>('/admin/shipping/methods', input);
  return res.data;
}

export async function updateShippingMethod(
  id: string,
  input: UpdateShippingMethodInput
): Promise<ShippingMethodEntity> {
  const res = await api.patch<ShippingMethodEntity>(
    `/admin/shipping/methods/${encodeURIComponent(id)}`,
    input
  );
  return res.data;
}

export async function deleteShippingMethod(id: string): Promise<{ success: boolean; message: string }> {
  const res = await api.delete<{ success: boolean; message: string }>(
    `/admin/shipping/methods/${encodeURIComponent(id)}`
  );
  return res.data;
}

// Order Shipments
export async function fetchOrderShipments(
  orderId: string,
  signal?: AbortSignal
): Promise<ShipmentEntity[]> {
  const res = await api.get<ShipmentEntity[]>(
    `/admin/shipping/orders/${encodeURIComponent(orderId)}/shipments`,
    { signal }
  );
  return res.data;
}

export async function createOrderShipment(
  orderId: string,
  input: CreateOrderShipmentInput
): Promise<ShipmentEntity> {
  const res = await api.post<ShipmentEntity>(
    `/admin/shipping/orders/${encodeURIComponent(orderId)}/shipments`,
    input
  );
  return res.data;
}

export async function updateOrderShipmentStatus(
  orderId: string,
  input: UpdateShipmentStatusInput
): Promise<ShipmentEntity> {
  const res = await api.patch<ShipmentEntity>(
    `/admin/shipping/orders/${encodeURIComponent(orderId)}/shipments/status`,
    input
  );
  return res.data;
}

export async function updateShipmentStatus(
  shipmentId: string,
  input: UpdateShipmentStatusInput
): Promise<ShipmentEntity> {
  const res = await api.patch<ShipmentEntity>(
    `/admin/shipping/shipments/${encodeURIComponent(shipmentId)}/status`,
    input
  );
  return res.data;
}

