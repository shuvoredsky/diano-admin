import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Coupons',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Coupons"
      route="/admin/coupons"
      description="Promotional discount codes and usage constraint management foundation."
    />
  );
}
