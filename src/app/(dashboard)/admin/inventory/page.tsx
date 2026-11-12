import type { Metadata } from 'next';
import { InventoryManager } from '@/features/inventory';

export const metadata: Metadata = {
  title: 'Inventory & Stock Ledger | DIANO Admin',
  description: 'Multi-warehouse stock levels, reorder alerts, and immutable audit ledger',
};

export default function InventoryPage() {
  return <InventoryManager />;
}
