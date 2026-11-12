import type { Metadata } from 'next';
import { ProductEditView } from '@/features/products/components/product-edit-view';

export const metadata: Metadata = {
  title: 'Edit Product | DIANO Admin',
  description: 'Manage catalog item, variants, and media slots',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductEditView productId={id} />;
}

