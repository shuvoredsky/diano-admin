'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
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
  const authState = useAppSelector((state) => state.auth);
  const { data: queryUser, isLoading: isQueryLoading } = useQuery({
    ...currentAdminQueryOptions(),
    enabled: authState.status === 'authenticated',
  });

  const user = authState.user || queryUser;
  const roles = authState.roles.length > 0 ? authState.roles : (user?.roles ?? []);
  const permissions = authState.permissions.length > 0 ? authState.permissions : (user?.permissions ?? []);
  const isSuperAdmin = Boolean(
    authState.isSuperAdmin ||
      user?.isSuperAdmin ||
      roles.includes('super-admin') ||
      roles.includes('SUPER_ADMIN')
  );
  const isAuthenticated = authState.status === 'authenticated' || Boolean(user?.id);
  const isLoading =
    authState.status === 'loading' ||
    (authState.status === 'authenticated' && isQueryLoading && !user);

  const hasPermission = (permission: PermissionSlug | string): boolean => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: (PermissionSlug | string)[]): boolean => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some((perm) => permissions.includes(perm));
  };

  const hasAllPermissions = (requiredPermissions: (PermissionSlug | string)[]): boolean => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every((perm) => permissions.includes(perm));
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
