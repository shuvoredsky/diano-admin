import type { Metadata } from 'next';
import { CustomersManager } from '@/features/customers';

export const metadata: Metadata = {
  title: 'Customers | DIANO Admin',
  description: 'Customer directory, account status, communication preferences, and lifetime order histories',
};

export default function AdminCustomersPage() {
  return <CustomersManager />;
}
