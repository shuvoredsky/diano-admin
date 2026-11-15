export type StaffStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'PENDING_VERIFICATION';

export interface StaffRoleItem {
  id: string;
  name: string;
  slug: string;
}

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: StaffStatus;
  roles: StaffRoleItem[];
  createdAt: string;
  updatedAt: string;
  temporaryPassword?: string | null;
}

export interface CreateStaffInput {
  email: string;
  name: string;
  phone?: string | null;
  roleSlug: string;
  password?: string;
}

export interface UpdateStaffInput {
  name?: string;
  phone?: string | null;
  roleSlug?: string;
}

export interface StaffFilterParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}
