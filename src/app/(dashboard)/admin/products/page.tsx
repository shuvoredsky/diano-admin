import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Products',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Products"
      route="/admin/products"
      description="Catalog management, variants, pricing, and Cloudinary media slots foundation."
    />
  );
}
