'use client';

import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import type { PermissionSlug } from '@/constants/permissions';

export interface PermissionGateProps {
  permission?: PermissionSlug | string;
  permissions?: (PermissionSlug | string)[];
  all?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  all = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin } = usePermissions();

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  const isAllowed = permission
    ? hasPermission(permission)
    : permissions && permissions.length > 0
      ? all
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions)
      : true;

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export const Can = PermissionGate;
