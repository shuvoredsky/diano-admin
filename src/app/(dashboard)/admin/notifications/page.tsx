import type { Metadata } from 'next';
import { NotificationsManager } from '@/features/notifications/components/notifications-manager';

export const metadata: Metadata = {
  title: 'Notifications | DIANO Admin',
  description: 'Real-time Socket.IO admin alerts and outbox delivery logs.',
};

export default function AdminNotificationsPage() {
  return <NotificationsManager />;
}
