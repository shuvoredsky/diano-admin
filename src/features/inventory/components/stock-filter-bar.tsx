'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FilterBar } from '@/components/tables/filter-bar';

export function StockFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLowStock = searchParams?.get('lowStockOnly') === 'true';
  const currentOutOfStock = searchParams?.get('outOfStockOnly') === 'true';

  const toggleFilter = (key: string, currentValue: boolean) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (!currentValue) {
      params.set(key, 'true');
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <FilterBar
      searchPlaceholder="Search inventory by product, variant, SKU or barcode..."
      searchParamKey="search"
      onClearFilters={() => router.push(pathname)}
    >
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-foreground">
          <input
            type="checkbox"
            checked={currentLowStock}
            onChange={() => toggleFilter('lowStockOnly', currentLowStock)}
            className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
          />
          <span>Low Stock Only</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-foreground">
          <input
            type="checkbox"
            checked={currentOutOfStock}
            onChange={() => toggleFilter('outOfStockOnly', currentOutOfStock)}
            className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
          />
          <span>Out of Stock Only</span>
        </label>
      </div>
    </FilterBar>
  );
}

