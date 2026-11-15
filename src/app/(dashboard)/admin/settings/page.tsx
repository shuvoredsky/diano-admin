import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { SettingsManager } from '@/features/cms';

export const metadata: Metadata = {
  title: 'Settings | DIANO Admin',
  description: 'Manage store profile, branding, invoice PDF format, SEO defaults, and helplines.',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform & Store Configuration"
        description="Configure branding identity, tax numbers, invoice formatting, and customer support."
      />
      <SettingsManager />
    </div>
  );
}
