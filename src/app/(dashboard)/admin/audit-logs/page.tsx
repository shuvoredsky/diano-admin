import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Audit Logs',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Audit Logs"
      route="/admin/audit-logs"
      description="Immutable security and administrative action audit trail foundation."
    />
  );
}
