import type { Metadata } from 'next';
import { SuppliersManager } from '@/features/suppliers';

export const metadata: Metadata = {
  title: 'Suppliers | DIANO Admin',
  description: 'Manage vendor directory, contact records, and purchase orders',
};

export default function SuppliersPage() {
  return <SuppliersManager />;
}
