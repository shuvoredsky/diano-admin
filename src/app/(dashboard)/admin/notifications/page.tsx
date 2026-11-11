import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Notifications',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Notifications"
      route="/admin/notifications"
      description="Real-time Socket.IO admin alerts and outbox delivery logs foundation."
    />
  );
}
