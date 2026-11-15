import type { Metadata } from 'next';
import { FlashSalesManager } from '@/features/flash-sales';

export const metadata: Metadata = {
  title: 'Flash Sales',
  description: 'Manage time-limited flash sales campaigns and product discounts.',
};

export default function AdminFlashSalesPage() {
  return <FlashSalesManager />;
}
