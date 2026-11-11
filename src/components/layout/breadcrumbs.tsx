'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Dashboard',
  analytics: 'Analytics',
  products: 'Products',
  categories: 'Categories',
  inventory: 'Inventory',
  audits: 'Stock Audits',
  suppliers: 'Suppliers',
  purchases: 'Purchase Orders',
  orders: 'Orders',
  'abandoned-checkouts': 'Abandoned Checkouts',
  shipping: 'Shipping',
  returns: 'Returns',
  refunds: 'Refunds',
  customers: 'Customers',
  reviews: 'Reviews',
  payments: 'Payments',
  'fraud-detection': 'Fraud Detection',
  coupons: 'Coupons',
  'flash-sales': 'Flash Sales',
  reports: 'Reports',
  expenses: 'Expenses',
  cms: 'CMS',
  notifications: 'Notifications',
  staff: 'Staff',
  'roles-permissions': 'Roles & Permissions',
  'audit-logs': 'Audit Logs',
  settings: 'Settings',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0 || pathname === '/admin') {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-medium text-foreground">
          <Home className="h-3.5 w-3.5" />
          Dashboard
        </span>
      </nav>
    );
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = ROUTE_LABELS[segment] || segment.replace(/-/g, ' ');
    const isLast = index === segments.length - 1;

    return {
      href,
      label,
      isLast,
    };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-muted-foreground">
      <Link href="/admin" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {breadcrumbs.map(crumb => (
        <div key={crumb.href} className="flex items-center space-x-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          {crumb.isLast ? (
            <span className="font-semibold text-foreground capitalize">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors capitalize">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
