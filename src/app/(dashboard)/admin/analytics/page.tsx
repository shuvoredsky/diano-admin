import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Analytics',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Analytics"
      route="/admin/analytics"
      description="Business intelligence, revenue metrics, and executive KPIs foundation."
    />
  );
}
