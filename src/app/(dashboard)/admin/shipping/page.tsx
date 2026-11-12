import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Shipping',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Shipping"
      route="/admin/shipping"
      description="Delivery zones, courier rates, and shipment tracking foundation."
    />
  );
}
