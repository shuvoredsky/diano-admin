import {
  ADMIN_ROLE_SLUGS,
  ROLE_HIERARCHY,
  SYSTEM_ROLE_SLUGS,
  type SystemRoleSlug,
} from '@/constants/auth';
import type { PermissionSlug } from '@/constants/permissions';
import type { AuthUserSummary } from '@/types/auth.types';

/**
 * Checks whether a user possesses at least one administrative/staff role slug.
 * Note: Client-side checks are for UI presentation only; backend RBAC remains authoritative.
 */
export function isStaffUser(user: Pick<AuthUserSummary, 'roles'> | null | undefined): boolean {
  if (!user || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.some((role) =>
    ADMIN_ROLE_SLUGS.includes(role.toLowerCase() as SystemRoleSlug),
  );
}

/**
 * Checks whether the user holds the super-admin or admin role (which grant all permissions in diano-server).
 */
export function hasFullAdminAccess(
  user: Pick<AuthUserSummary, 'roles'> | null | undefined,
): boolean {
  if (!user || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.some((role) => {
    const normalized = role.toLowerCase();
    return normalized === SYSTEM_ROLE_SLUGS.SUPER_ADMIN || normalized === SYSTEM_ROLE_SLUGS.ADMIN;
  });
}

/**
 * Evaluates whether the user has a required granular permission slug.
 * Super Admin and Admin roles automatically satisfy all permission checks per diano-server seed.ts.
 */
export function hasPermission(
  user: Pick<AuthUserSummary, 'roles' | 'permissions'> | null | undefined,
  requiredPermission: PermissionSlug | string,
): boolean {
  if (!user) {
    return false;
  }
  if (hasFullAdminAccess(user)) {
    return true;
  }
  if (!Array.isArray(user.permissions)) {
    return false;
  }
  return user.permissions.includes(requiredPermission);
}

/**
 * Evaluates whether the user has ANY of the specified permissions.
 */
export function hasAnyPermission(
  user: Pick<AuthUserSummary, 'roles' | 'permissions'> | null | undefined,
  requiredPermissions: readonly (PermissionSlug | string)[],
): boolean {
  if (requiredPermissions.length === 0) {
    return true;
  }
  return requiredPermissions.some((perm) => hasPermission(user, perm));
}

/**
 * Returns the highest role hierarchy level held by the user.
 */
export function getHighestRoleLevel(
  user: Pick<AuthUserSummary, 'roles'> | null | undefined,
): number {
  if (!user || !Array.isArray(user.roles) || user.roles.length === 0) {
    return 0;
  }
  return Math.max(
    ...user.roles.map((role) => ROLE_HIERARCHY[role.toLowerCase()] ?? 0),
  );
}

