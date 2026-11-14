import type { Metadata } from 'next';
import { ReturnsManager } from '@/features/returns';

export const metadata: Metadata = {
  title: 'Returns & RMA',
  description: 'Manage return requests, warehouse inspections, and customer resolutions.',
};

export default function ReturnsPage() {
  return <ReturnsManager />;
}
