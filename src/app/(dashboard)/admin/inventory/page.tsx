import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Inventory',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Inventory"
      route="/admin/inventory"
      description="Stock levels, warehouse ledger, and low-stock threshold foundation."
    />
  );
}
