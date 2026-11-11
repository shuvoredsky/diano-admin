import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Staff',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Staff"
      route="/admin/staff"
      description="Admin staff accounts and operational status management foundation."
    />
  );
}
