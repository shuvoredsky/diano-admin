import type { Metadata } from 'next';
import { AbandonedManager } from '@/features/abandoned';

export const metadata: Metadata = {
  title: 'Abandoned Checkouts | DIANO Admin',
  description: 'Monitor abandoned sessions, cart retention, and automated recovery campaigns',
};

export default function AdminAbandonedCheckoutsPage() {
  return <AbandonedManager />;
}
