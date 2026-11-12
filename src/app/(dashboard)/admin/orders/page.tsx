import type { Metadata } from 'next';
import { OrdersManager } from '@/features/orders';

export const metadata: Metadata = {
  title: 'Orders | DIANO Admin',
  description: 'Order lifecycle state machine, fulfillment, and invoicing',
};

export default function AdminOrdersPage() {
  return <OrdersManager />;
}
