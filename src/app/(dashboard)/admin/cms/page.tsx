import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'CMS',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="CMS"
      route="/admin/cms"
      description="Storefront banners, static pages, branding settings, and content revisions foundation."
    />
  );
}
