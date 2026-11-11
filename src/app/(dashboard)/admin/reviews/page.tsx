import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Reviews',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Reviews"
      route="/admin/reviews"
      description="Customer product reviews moderation and rating analytics foundation."
    />
  );
}
