import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Suppliers',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Suppliers"
      route="/admin/suppliers"
      description="Vendor directory and supplier contact management foundation."
    />
  );
}
