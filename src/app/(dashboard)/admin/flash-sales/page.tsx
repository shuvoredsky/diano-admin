import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Flash Sales',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Flash Sales"
      route="/admin/flash-sales"
      description="Time-bound promotional campaigns and scheduled pricing foundation."
    />
  );
}
