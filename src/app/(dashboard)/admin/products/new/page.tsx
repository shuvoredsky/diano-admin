import type { Metadata } from 'next';
import { ProductForm } from '@/features/products/components/form/product-form';

export const metadata: Metadata = {
  title: 'Add New Product | DIANO Admin',
  description: 'Create a new product with variants, pricing and attributes',
};

export default function NewProductPage() {
  return <ProductForm isCreateMode />;
}

