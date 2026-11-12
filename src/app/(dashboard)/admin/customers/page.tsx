import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Customers',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Customers"
      route="/admin/customers"
      description="Customer profiles, order history, and account status foundation."
    />
  );
}
