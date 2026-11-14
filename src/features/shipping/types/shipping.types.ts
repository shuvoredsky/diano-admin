export type ShipmentStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED_ATTEMPT'
  | 'RETURNED_TO_ORIGIN'
  | 'RETURNING'
  | 'RETURNED';

export interface ShippingZoneEntity {
  id: string;
  name: string;
  districts: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  methods?: ShippingMethodEntity[];
}

export interface CreateShippingZoneInput {
  name: string;
  districts: string[];
  isActive?: boolean;
}

export interface UpdateShippingZoneInput {
  name?: string;
  districts?: string[];
  isActive?: boolean;
}

export interface ShippingMethodEntity {
  id: string;
  shippingZoneId: string;
  name: string;
  code: string;
  baseCharge: string | number;
  perKgCharge: string | number;
  freeShippingThreshold: string | number | null;
  estimatedDays: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shippingZone?: ShippingZoneEntity;
}

export interface CreateShippingMethodInput {
  shippingZoneId: string;
  name: string;
  code: string;
  baseCharge: string | number;
  perKgCharge?: string | number;
  freeShippingThreshold?: string | number | null;
  estimatedDays: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateShippingMethodInput {
  shippingZoneId?: string;
  name?: string;
  code?: string;
  baseCharge?: string | number;
  perKgCharge?: string | number;
  freeShippingThreshold?: string | number | null;
  estimatedDays?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ShipmentEventEntity {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location?: string | null;
  description: string;
  occurredAt: string;
  createdAt: string;
}

export interface ShipmentEntity {
  id: string;
  orderId: string;
  shippingMethodId?: string | null;
  courierName: string;
  trackingNumber?: string | null;
  status: ShipmentStatus;
  labelUrl?: string | null;
  dispatchedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  events?: ShipmentEventEntity[];
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    shippingAddress?: unknown;
  };
  shippingMethod?: ShippingMethodEntity;
}

export interface CreateOrderShipmentInput {
  shippingMethodId?: string;
  courierName: string;
  trackingNumber?: string;
  status?: ShipmentStatus;
  labelUrl?: string;
  notes?: string;
}

export interface UpdateShipmentStatusInput {
  status: ShipmentStatus;
  location?: string;
  note?: string;
}

