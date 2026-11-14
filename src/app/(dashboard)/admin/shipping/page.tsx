import type { Metadata } from 'next';
import { ShippingManager } from '@/features/shipping';

export const metadata: Metadata = {
  title: 'Shipping & Logistics',
  description: 'Manage delivery zones, shipping methods, and courier charges.',
};

export default function ShippingPage() {
  return <ShippingManager />;
}
