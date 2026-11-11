import { describe, expect, it } from 'vitest';

import { SYSTEM_ROLE_SLUGS } from '@/constants/auth';
import { PERMISSIONS } from '@/constants/permissions';
import {
  getHighestRoleLevel,
  hasAnyPermission,
  hasFullAdminAccess,
  hasPermission,
  isStaffUser,
} from '@/lib/permissions/permission-guard';
import type { AuthUserSummary } from '@/types/auth.types';

const superAdminUser: AuthUserSummary = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'super@diano.com.bd',
  name: 'Super Admin',
  phone: null,
  avatarUrl: null,
  roles: [SYSTEM_ROLE_SLUGS.SUPER_ADMIN],
};

const supportUser: AuthUserSummary = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'support@diano.com.bd',
  name: 'Support Staff',
  phone: null,
  avatarUrl: null,
  roles: [SYSTEM_ROLE_SLUGS.SUPPORT_STAFF],
  permissions: [PERMISSIONS.ORDER_READ, PERMISSIONS.CUSTOMER_READ],
};

const customerUser: AuthUserSummary = {
  id: '00000000-0000-0000-0000-000000000003',
  email: 'customer@example.com',
  name: 'Customer',
  phone: null,
  avatarUrl: null,
  roles: [SYSTEM_ROLE_SLUGS.CUSTOMER],
};

describe('RBAC Permission & Role Hierarchy Guard', () => {
  it('identifies staff roles vs customer roles accurately', () => {
    expect(isStaffUser(superAdminUser)).toBe(true);
    expect(isStaffUser(supportUser)).toBe(true);
    expect(isStaffUser(customerUser)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
  });

  it('grants full permission access to super-admin and admin roles', () => {
    expect(hasFullAdminAccess(superAdminUser)).toBe(true);
    expect(hasPermission(superAdminUser, PERMISSIONS.PRODUCT_CREATE)).toBe(true);
    expect(hasPermission(supportUser, PERMISSIONS.PRODUCT_CREATE)).toBe(false);
  });

  it('evaluates explicit permissions for non-admin staff roles', () => {
    expect(hasPermission(supportUser, PERMISSIONS.ORDER_READ)).toBe(true);
    expect(hasPermission(supportUser, PERMISSIONS.SETTINGS_UPDATE)).toBe(false);
    expect(
      hasAnyPermission(supportUser, [PERMISSIONS.SETTINGS_UPDATE, PERMISSIONS.CUSTOMER_READ])
    ).toBe(true);
  });

  it('computes highest role hierarchy level', () => {
    expect(getHighestRoleLevel(superAdminUser)).toBe(100);
    expect(getHighestRoleLevel(supportUser)).toBe(20);
    expect(getHighestRoleLevel(customerUser)).toBe(0);
  });
});
