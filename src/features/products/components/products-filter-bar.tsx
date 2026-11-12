'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FilterBar } from '@/components/tables/filter-bar';
import { useCategoriesQuery } from '@/features/categories';
import type { CategoryItem } from '@/features/categories';

export function ProductsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: categories = [] } = useCategoriesQuery();

  const currentCategory = searchParams?.get('categoryId') || '';
  const currentStatus = searchParams?.get('status') || '';
  const currentStock = searchParams?.get('inStock') || '';
  const currentSortBy = searchParams?.get('sortBy') || 'createdAt';
  const currentSortOrder = searchParams?.get('sortOrder') || 'desc';
  const currentSortValue = `${currentSortBy}:${currentSortOrder}`;

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const flattenCategories = (items: CategoryItem[], prefix = ''): { id: string; name: string }[] => {
    let result: { id: string; name: string }[] = [];
    for (const cat of items) {
      result.push({
        id: cat.id,
        name: prefix ? `${prefix} > ${cat.name}` : cat.name,
      });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, prefix ? `${prefix} > ${cat.name}` : cat.name));
      }
    }
    return result;
  };

  const flattenedCategories = flattenCategories(categories);

  return (
    <FilterBar
      searchPlaceholder="Search products by name, SKU or barcode..."
      searchParamKey="q"
      onClearFilters={() => router.push(pathname)}
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Select */}
        <select
          value={currentCategory}
          onChange={e => updateParam('categoryId', e.target.value)}
          aria-label="Filter by Category"
          className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {flattenedCategories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Status Select */}
        <select
          value={currentStatus}
          onChange={e => updateParam('status', e.target.value)}
          aria-label="Filter by Status"
          className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {/* Stock Filter */}
        <select
          value={currentStock}
          onChange={e => updateParam('inStock', e.target.value)}
          aria-label="Filter by Stock"
          className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Stock</option>
          <option value="true">In Stock</option>
          <option value="false">Out of Stock</option>
        </select>

        {/* Sort Select */}
        <select
          value={currentSortValue}
          onChange={e => {
            const parts = e.target.value.split(':');
            const field = parts[0] || 'createdAt';
            const order = parts[1] || 'desc';
            const params = new URLSearchParams(searchParams?.toString() || '');
            params.set('sortBy', field);
            params.set('sortOrder', order);
            router.push(`${pathname}?${params.toString()}`);
          }}
          aria-label="Sort by"
          className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="createdAt:desc">Newest First</option>
          <option value="createdAt:asc">Oldest First</option>
          <option value="name:asc">Name: A to Z</option>
          <option value="name:desc">Name: Z to A</option>
          <option value="mrp:desc">Price: High to Low</option>
          <option value="mrp:asc">Price: Low to High</option>
          <option value="updatedAt:desc">Recently Updated</option>
        </select>
      </div>
    </FilterBar>
  );
}

