import type { Metadata } from 'next';
import { CouponsManager } from '@/features/coupons';

export const metadata: Metadata = {
  title: 'Coupons & Vouchers',
  description: 'Manage store promotional discount vouchers and coupon codes.',
};

export default function AdminCouponsPage() {
  return <CouponsManager />;
}
