export interface PermissionItem {
  id: string;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string | null;
}

export interface RoleSummaryItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string | null;
  isSystem: boolean;
  permissionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoleDetailItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string | null;
  isSystem: boolean;
  permissions: PermissionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  name: string;
  slug: string;
  description?: string;
  permissionSlugs?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

export interface AssignPermissionsInput {
  permissionSlugs: string[];
}
