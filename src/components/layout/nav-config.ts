import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  LineChart,
  Package,
  FolderTree,
  Boxes,
  Building2,
  ShoppingCart,
  ClipboardCheck,
  ShoppingBag,
  Timer,
  Truck,
  RotateCcw,
  Receipt,
  Users,
  MessageSquareQuote,
  CreditCard,
  ShieldAlert,
  Ticket,
  Zap,
  FileSpreadsheet,
  Wallet,
  Newspaper,
  Bell,
  UserCheck,
  KeyRound,
  History,
  Settings,
} from 'lucide-react';
import { PERMISSIONS, type PermissionSlug } from '@/constants/permissions';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  permissions?: PermissionSlug[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const SIDEBAR_NAV_GROUPS: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        permissions: [PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.ORDER_READ, PERMISSIONS.INVENTORY_READ],
      },
      {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: LineChart,
        permissions: [PERMISSIONS.ANALYTICS_VIEW],
      },
    ],
  },
  {
    title: 'CATALOG',
    items: [
      {
        title: 'Products',
        href: '/admin/products',
        icon: Package,
        permissions: [PERMISSIONS.PRODUCT_READ],
      },
      {
        title: 'Categories',
        href: '/admin/categories',
        icon: FolderTree,
        permissions: [PERMISSIONS.CATEGORY_READ],
      },
    ],
  },
  {
    title: 'INVENTORY',
    items: [
      {
        title: 'Stock Overview',
        href: '/admin/inventory',
        icon: Boxes,
        permissions: [PERMISSIONS.INVENTORY_READ],
      },
      {
        title: 'Suppliers',
        href: '/admin/suppliers',
        icon: Building2,
        permissions: [PERMISSIONS.SUPPLIER_READ, PERMISSIONS.SUPPLIER_MANAGE],
      },
      {
        title: 'Purchase Orders',
        href: '/admin/purchases',
        icon: ShoppingCart,
        permissions: [PERMISSIONS.SUPPLIER_READ, PERMISSIONS.SUPPLIER_MANAGE],
      },
      {
        title: 'Stock Audit',
        href: '/admin/inventory/audits',
        icon: ClipboardCheck,
        permissions: [PERMISSIONS.INVENTORY_AUDIT],
      },
    ],
  },
  {
    title: 'SALES & OPERATIONS',
    items: [
      {
        title: 'Orders',
        href: '/admin/orders',
        icon: ShoppingBag,
        permissions: [PERMISSIONS.ORDER_READ, PERMISSIONS.ORDER_MANAGE],
      },
      {
        title: 'Abandoned Checkouts',
        href: '/admin/abandoned-checkouts',
        icon: Timer,
        permissions: [PERMISSIONS.ABANDONED_CHECKOUT_READ, PERMISSIONS.ABANDONED_CHECKOUT_MANAGE],
      },
      {
        title: 'Shipping',
        href: '/admin/shipping',
        icon: Truck,
        permissions: [PERMISSIONS.SHIPPING_READ, PERMISSIONS.SHIPPING_DISPATCH, PERMISSIONS.SHIPPING_MANAGE],
      },
      {
        title: 'Returns',
        href: '/admin/returns',
        icon: RotateCcw,
        permissions: [PERMISSIONS.RETURN_READ, PERMISSIONS.RETURN_APPROVE, PERMISSIONS.RETURN_INSPECT, PERMISSIONS.RETURN_MANAGE],
      },
      {
        title: 'Refunds',
        href: '/admin/refunds',
        icon: Receipt,
        permissions: [PERMISSIONS.REFUND_READ, PERMISSIONS.REFUND_APPROVE, PERMISSIONS.REFUND_MANAGE, PERMISSIONS.PAYMENT_REFUND],
      },
    ],
  },
  {
    title: 'CUSTOMERS',
    items: [
      {
        title: 'Customers',
        href: '/admin/customers',
        icon: Users,
        permissions: [PERMISSIONS.CUSTOMER_READ, PERMISSIONS.CUSTOMER_MANAGE, PERMISSIONS.USER_READ],
      },
      {
        title: 'Reviews',
        href: '/admin/reviews',
        icon: MessageSquareQuote,
        permissions: [PERMISSIONS.REVIEW_READ, PERMISSIONS.REVIEW_MODERATE],
      },
    ],
  },
  {
    title: 'PAYMENTS & SECURITY',
    items: [
      {
        title: 'Payments',
        href: '/admin/payments',
        icon: CreditCard,
        permissions: [PERMISSIONS.PAYMENT_READ, PERMISSIONS.PAYMENT_MANAGE],
      },
      {
        title: 'Fraud Detection',
        href: '/admin/fraud-detection',
        icon: ShieldAlert,
        permissions: [PERMISSIONS.FRAUD_READ, PERMISSIONS.FRAUD_REVIEW, PERMISSIONS.FRAUD_MANAGE],
      },
    ],
  },
  {
    title: 'MARKETING',
    items: [
      {
        title: 'Coupons',
        href: '/admin/coupons',
        icon: Ticket,
        permissions: [PERMISSIONS.COUPON_READ, PERMISSIONS.COUPON_MANAGE],
      },
      {
        title: 'Flash Sales',
        href: '/admin/flash-sales',
        icon: Zap,
        permissions: [PERMISSIONS.COUPON_MANAGE],
      },
    ],
  },
  {
    title: 'REPORTING',
    items: [
      {
        title: 'Reports',
        href: '/admin/reports',
        icon: FileSpreadsheet,
        permissions: [PERMISSIONS.REPORT_EXPORT],
      },
      {
        title: 'Expenses',
        href: '/admin/expenses',
        icon: Wallet,
        permissions: [PERMISSIONS.EXPENSE_MANAGE],
      },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      {
        title: 'CMS',
        href: '/admin/cms',
        icon: Newspaper,
        permissions: [PERMISSIONS.BANNER_MANAGE, PERMISSIONS.PAGE_MANAGE, PERMISSIONS.SETTINGS_READ],
      },
      {
        title: 'Notifications',
        href: '/admin/notifications',
        icon: Bell,
        permissions: [PERMISSIONS.NOTIFICATION_READ, PERMISSIONS.NOTIFICATION_SEND, PERMISSIONS.NOTIFICATION_MANAGE],
      },
      {
        title: 'Staff',
        href: '/admin/staff',
        icon: UserCheck,
        permissions: [PERMISSIONS.USER_READ, PERMISSIONS.USER_MANAGE],
      },
      {
        title: 'Roles & Permissions',
        href: '/admin/roles-permissions',
        icon: KeyRound,
        permissions: [PERMISSIONS.ROLE_READ, PERMISSIONS.ROLE_UPDATE, PERMISSIONS.ROLE_CREATE],
      },
      {
        title: 'Audit Logs',
        href: '/admin/audit-logs',
        icon: History,
        permissions: [PERMISSIONS.AUDIT_VIEW],
      },
      {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        permissions: [PERMISSIONS.SETTINGS_READ, PERMISSIONS.SETTINGS_UPDATE],
      },
    ],
  },
];
