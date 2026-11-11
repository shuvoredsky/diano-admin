import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Returns',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Returns"
      route="/admin/returns"
      description="Return merchandise authorization (RMA) and inspection workflow foundation."
    />
  );
}
