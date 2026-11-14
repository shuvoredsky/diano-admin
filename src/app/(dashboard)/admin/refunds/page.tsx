import type { Metadata } from 'next';
import { RefundsManager } from '@/features/refunds';

export const metadata: Metadata = {
  title: 'Refunds & Settlements',
  description: 'Manage customer refunds, order cancellations, and gateway disbursements.',
};

export default function RefundsPage() {
  return <RefundsManager />;
}
