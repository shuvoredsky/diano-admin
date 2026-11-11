'use client';

import { useQuery } from '@tanstack/react-query';
import { currentAdminQueryOptions } from '../api/auth.queries';
import type { AuthUserSummary } from '@/types/auth.types';
import type { PermissionSlug } from '@/constants/permissions';

export interface UseAuthPermissionsResult {
  user: AuthUserSummary | undefined;
  permissions: string[];
  roles: string[];
  isSuperAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: PermissionSlug | string) => boolean;
  hasAnyPermission: (permissions: (PermissionSlug | string)[]) => boolean;
  hasAllPermissions: (permissions: (PermissionSlug | string)[]) => boolean;
}

export function useAuthPermissions(): UseAuthPermissionsResult {
  const { data: user, isLoading } = useQuery(currentAdminQueryOptions());

  const roles = user?.roles ?? [];
  const permissions = user?.permissions ?? [];
  const isSuperAdmin = Boolean(
    user?.isSuperAdmin || roles.includes('super-admin')
  );
  const isAuthenticated = Boolean(user?.id);

  const hasPermission = (permission: PermissionSlug | string): boolean => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: (PermissionSlug | string)[]): boolean => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some(perm => permissions.includes(perm));
  };

  const hasAllPermissions = (requiredPermissions: (PermissionSlug | string)[]): boolean => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every(perm => permissions.includes(perm));
  };

  return {
    user,
    permissions,
    roles,
    isSuperAdmin,
    isLoading,
    isAuthenticated,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
