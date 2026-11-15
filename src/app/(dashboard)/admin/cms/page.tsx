import type { Metadata } from 'next';
import { CmsManager } from '@/features/cms';

export const metadata: Metadata = {
  title: 'Content Management & Branding | DIANO Admin',
  description: 'Manage storefront promotional banners, static legal pages, revisions, and store settings.',
};

export default function CmsPage() {
  return <CmsManager />;
}
