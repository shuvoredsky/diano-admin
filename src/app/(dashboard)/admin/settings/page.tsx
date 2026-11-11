import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Settings"
      route="/admin/settings"
      description="Platform configuration, BDT currency, and Asia/Dhaka operational settings foundation."
    />
  );
}
