/**
 * Application Route Constants for DIANO Admin Dashboard
 */

export const AUTH_ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
} as const;

export const ADMIN_ROUTES = {
  ROOT: '/admin',
  ANALYTICS: '/admin/analytics',
  PRODUCTS: '/admin/products',
  CATEGORIES: '/admin/categories',
  INVENTORY: '/admin/inventory',
  SUPPLIERS: '/admin/suppliers',
  PURCHASES: '/admin/purchases',
  ORDERS: '/admin/orders',
  ABANDONED_CHECKOUTS: '/admin/abandoned-checkouts',
  CUSTOMERS: '/admin/customers',
  PAYMENTS: '/admin/payments',
  FRAUD_DETECTION: '/admin/fraud-detection',
  COUPONS: '/admin/coupons',
  FLASH_SALES: '/admin/flash-sales',
  SHIPPING: '/admin/shipping',
  RETURNS: '/admin/returns',
  REFUNDS: '/admin/refunds',
  REVIEWS: '/admin/reviews',
  REPORTS: '/admin/reports',
  NOTIFICATIONS: '/admin/notifications',
  CMS: '/admin/cms',
  STAFF: '/admin/staff',
  ROLES_PERMISSIONS: '/admin/roles-permissions',
  AUDIT_LOGS: '/admin/audit-logs',
  SETTINGS: '/admin/settings',
} as const;

export const PUBLIC_AUTH_PATHS: readonly string[] = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
  AUTH_ROUTES.VERIFY_EMAIL,
];

