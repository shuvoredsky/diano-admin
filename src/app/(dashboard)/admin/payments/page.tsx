import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Payments',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Payments"
      route="/admin/payments"
      description="SSLCOMMERZ and COD payment transaction reconciliation foundation."
    />
  );
}
