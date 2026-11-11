import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Categories',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Categories"
      route="/admin/categories"
      description="Hierarchical category tree and specification template management foundation."
    />
  );
}
