import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Orders',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Orders"
      route="/admin/orders"
      description="Order lifecycle state machine, fulfillment, and invoice PDF foundation."
    />
  );
}
