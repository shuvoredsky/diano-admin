import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Reports',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Reports"
      route="/admin/reports"
      description="Financial exports, expense tracking, and tax reporting foundation."
    />
  );
}
