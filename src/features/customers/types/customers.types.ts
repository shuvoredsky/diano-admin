export type CustomerStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'PENDING_VERIFICATION';

export type AddressType = 'SHIPPING' | 'BILLING';

export type ConsentChannel = 'SMS' | 'EMAIL' | 'WHATSAPP';

export type ConsentPurpose = 'MARKETING' | 'RECOVERY' | 'ANALYTICS';

export interface CustomerAddress {
  id: string;
  userId: string;
  type: AddressType;
  isDefault: boolean;
  fullName: string;
  phone: string;
  alternativePhone?: string | null;
  addressLine: string;
  district: string;
  city: string;
  area?: string | null;
  postalCode?: string | null;
  landmark?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderSummary {
  totalOrders: number;
  totalSpent: string | number;
  cancelledOrders: number;
  returnedOrders: number;
}

export interface ConsentPreferenceItem {
  channel: ConsentChannel;
  purpose: ConsentPurpose;
  isGranted: boolean;
}

export interface CustomerNoteItem {
  id: string;
  authorId?: string | null;
  note: string;
  createdAt: string;
}

export interface CustomerTimelineItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface CustomerListItem extends Record<string, unknown> {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: CustomerStatus;
  loyaltyPoints: number;
  totalSpent: string | number;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetailAdminView {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: CustomerStatus;
  loyaltyPoints: number;
  dateOfBirth?: string | null;
  gender?: string | null;
  addresses: CustomerAddress[];
  consents: ConsentPreferenceItem[];
  orderSummary: CustomerOrderSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateCustomerStatusInput {
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface AddCustomerNoteInput {
  note: string;
}
