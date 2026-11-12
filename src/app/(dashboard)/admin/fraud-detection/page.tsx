import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Fraud Detection',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Fraud Detection"
      route="/admin/fraud-detection"
      description="Risk scoring rules, velocity checks, and manual fraud review queue foundation."
    />
  );
}
