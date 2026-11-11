import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Abandoned Checkouts',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Abandoned Checkouts"
      route="/admin/abandoned-checkouts"
      description="Recovery outreach and abandoned cart tracking foundation."
    />
  );
}
