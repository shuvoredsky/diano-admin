import { DashboardView } from '@/features/analytics/components/dashboard-view';

export const metadata = {
  title: 'Dashboard Overview | DIANO Admin',
  description: 'Executive overview, real-time KPI metrics, and operational performance.',
};

export default function AdminRootPage() {
  return <DashboardView />;
}
