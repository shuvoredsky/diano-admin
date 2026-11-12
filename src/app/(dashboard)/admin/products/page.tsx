import type { Metadata } from 'next';
import { ProductsListView } from '@/features/products';

export const metadata: Metadata = {
  title: 'Products | DIANO Admin',
  description: 'Manage catalog products, variants, pricing and media',
};

export default function AdminProductsPage() {
  return <ProductsListView />;
}
