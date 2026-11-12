import type { Metadata } from 'next';
import { PurchasesManager } from '@/features/purchases';

export const metadata: Metadata = {
  title: 'Purchase Orders | DIANO Admin',
  description: 'Procurement orders, vendor fulfillment, and inventory receiving',
};

export default function PurchasesPage() {
  return <PurchasesManager />;
}
