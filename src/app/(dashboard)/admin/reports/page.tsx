import type { Metadata } from 'next';
import { ReportsManager } from '@/features/reports';

export const metadata: Metadata = {
  title: 'Reports & Data Export | DIANO Admin',
  description: 'Download business intelligence and operational reports.',
};

export default function ReportsPage() {
  return <ReportsManager />;
}
