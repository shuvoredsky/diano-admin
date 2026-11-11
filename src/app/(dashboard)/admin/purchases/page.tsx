import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Purchases',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Purchases"
      route="/admin/purchases"
      description="Purchase orders, stock receiving, and supplier billing foundation."
    />
  );
}
