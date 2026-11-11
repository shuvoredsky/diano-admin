/**
 * Authentication & Session Constants aligned with diano-server
 * Source of truth: diano-server/src/modules/auth/auth.controller.ts & src/constants/roles.ts
 */

export const AUTH_COOKIE_NAMES = {
  /**
   * Exact HttpOnly refresh token cookie name used by diano-server
   * (`const REFRESH_COOKIE_NAME = 'diano_refresh_token'`)
   */
  REFRESH_TOKEN: 'diano_refresh_token',
} as const;

export const AUTH_HEADERS = {
  AUTHORIZATION: 'Authorization',
  IDEMPOTENCY_KEY: 'Idempotency-Key',
  REQUEST_ID: 'x-request-id',
} as const;

export const SYSTEM_ROLE_SLUGS = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  ORDER_MANAGER: 'order-manager',
  INVENTORY_MANAGER: 'inventory-manager',
  SUPPORT_STAFF: 'support-staff',
  CUSTOMER: 'customer',
} as const;

export type SystemRoleSlug = (typeof SYSTEM_ROLE_SLUGS)[keyof typeof SYSTEM_ROLE_SLUGS];

/**
 * Staff role slugs permitted to access the DIANO Admin Portal.
 * Matches ADMIN_ROLE_SLUGS in diano-server/src/constants/roles.ts
 */
export const ADMIN_ROLE_SLUGS: readonly SystemRoleSlug[] = [
  SYSTEM_ROLE_SLUGS.SUPER_ADMIN,
  SYSTEM_ROLE_SLUGS.ADMIN,
  SYSTEM_ROLE_SLUGS.MANAGER,
  SYSTEM_ROLE_SLUGS.ORDER_MANAGER,
  SYSTEM_ROLE_SLUGS.INVENTORY_MANAGER,
  SYSTEM_ROLE_SLUGS.SUPPORT_STAFF,
] as const;

/**
 * Role hierarchy levels matching diano-server/src/constants/roles.ts
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  [SYSTEM_ROLE_SLUGS.SUPER_ADMIN]: 100,
  [SYSTEM_ROLE_SLUGS.ADMIN]: 80,
  [SYSTEM_ROLE_SLUGS.MANAGER]: 60,
  [SYSTEM_ROLE_SLUGS.ORDER_MANAGER]: 40,
  [SYSTEM_ROLE_SLUGS.INVENTORY_MANAGER]: 40,
  [SYSTEM_ROLE_SLUGS.SUPPORT_STAFF]: 20,
  [SYSTEM_ROLE_SLUGS.CUSTOMER]: 0,
};

