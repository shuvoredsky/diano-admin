/**
 * Granular RBAC Permission Slugs aligned with diano-server/prisma/seed.ts (72 permissions)
 */

export const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',

  ROLE_READ: 'role:read',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  CUSTOMER_READ: 'customer:read',
  CUSTOMER_MANAGE: 'customer:manage',

  PRODUCT_READ: 'product:read',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  PRODUCT_PUBLISH: 'product:publish',
  PRODUCT_VIEW_COST: 'product:view_cost',

  CATEGORY_READ: 'category:read',
  CATEGORY_CREATE: 'category:create',
  CATEGORY_UPDATE: 'category:update',
  CATEGORY_DELETE: 'category:delete',

  INVENTORY_READ: 'inventory:read',
  INVENTORY_MANAGE: 'inventory:manage',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_AUDIT: 'inventory:audit',
  INVENTORY_VIEW_COST: 'inventory:view_cost',
  WAREHOUSE_MANAGE: 'warehouse:manage',

  SUPPLIER_READ: 'supplier:read',
  SUPPLIER_MANAGE: 'supplier:manage',

  ORDER_READ: 'order:read',
  ORDER_CREATE: 'order:create',
  ORDER_UPDATE_STATUS: 'order:update_status',
  ORDER_CONFIRM: 'order:confirm',
  ORDER_SHIP: 'order:ship',
  ORDER_CANCEL: 'order:cancel',
  ORDER_MANAGE: 'order:manage',
  ORDER_VIEW_COST: 'order:view_cost',

  CHECKOUT_READ: 'checkout:read',
  ABANDONED_CHECKOUT_READ: 'abandoned_checkout:read',
  ABANDONED_CHECKOUT_MANAGE: 'abandoned_checkout:manage',

  PAYMENT_READ: 'payment:read',
  PAYMENT_VERIFY: 'payment:verify',
  PAYMENT_MANAGE: 'payment:manage',
  PAYMENT_REFUND: 'payment:refund',

  REFUND_READ: 'refund:read',
  REFUND_APPROVE: 'refund:approve',
  REFUND_MANAGE: 'refund:manage',

  SHIPPING_READ: 'shipping:read',
  SHIPPING_DISPATCH: 'shipping:dispatch',
  SHIPPING_MANAGE: 'shipping:manage',

  COUPON_READ: 'coupon:read',
  COUPON_MANAGE: 'coupon:manage',

  FRAUD_READ: 'fraud:read',
  FRAUD_REVIEW: 'fraud:review',
  FRAUD_MANAGE: 'fraud:manage',

  RETURN_READ: 'return:read',
  RETURN_APPROVE: 'return:approve',
  RETURN_INSPECT: 'return:inspect',
  RETURN_MANAGE: 'return:manage',

  REVIEW_READ: 'review:read',
  REVIEW_MODERATE: 'review:moderate',

  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_SEND: 'notification:send',

  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_VIEW_FINANCE: 'analytics:view_finance',
  REPORT_EXPORT: 'report:export',
  REPORT_EXPORT_PII: 'report:export_pii',
  EXPENSE_MANAGE: 'expense:manage',

  AUDIT_VIEW: 'audit:view',
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
  BANNER_MANAGE: 'banner:manage',
  PAGE_MANAGE: 'page:manage',
} as const;

export type PermissionSlug = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

