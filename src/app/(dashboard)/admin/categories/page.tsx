import { CategoriesManager } from '@/features/categories/components/categories-manager';

export const metadata = {
  title: 'Categories | DIANO Admin',
  description: 'Hierarchical category tree with max 3 levels and specification templates.',
};

export default function AdminCategoriesPage() {
  return <CategoriesManager />;
}
