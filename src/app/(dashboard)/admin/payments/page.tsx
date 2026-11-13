import type { Metadata } from 'next';
import { PaymentsManager } from '@/features/payments';

export const metadata: Metadata = {
  title: 'Payments',
  description: 'SSLCOMMERZ and COD payment transactions reconciliation and settlement.',
};

export default function AdminPaymentsPage() {
  return <PaymentsManager />;
}
