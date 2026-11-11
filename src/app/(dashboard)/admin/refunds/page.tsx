import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Refunds',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Refunds"
      route="/admin/refunds"
      description="Refund processing, ledger adjustments, and settlement tracking foundation."
    />
  );
}
