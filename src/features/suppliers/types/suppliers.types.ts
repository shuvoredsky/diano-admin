export interface SupplierEntity {
  id: string;
  name: string;
  code: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    purchaseOrders: number;
  };
}

export interface CreateSupplierPayload {
  name: string;
  code?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface UpdateSupplierPayload {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface SupplierFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

