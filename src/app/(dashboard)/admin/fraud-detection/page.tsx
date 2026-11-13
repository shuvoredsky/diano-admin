import type { Metadata } from 'next';
import { FraudManager } from '@/features/fraud-detection';

export const metadata: Metadata = {
  title: 'Fraud Detection',
  description: 'Risk scoring rules, velocity checks, and manual fraud review queue.',
};

export default function AdminFraudDetectionPage() {
  return <FraudManager />;
}
