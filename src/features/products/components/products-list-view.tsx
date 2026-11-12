'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { ErrorState } from '@/components/feedback/error-state';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useTableQueryParams } from '@/lib/crud';
import { useAdminProductsQuery } from '../hooks/use-products-queries';
import type { ProductListFilterParams, ProductStatus } from '../types/products.types';
import { ProductsFilterBar } from './products-filter-bar';
import { ProductsTable } from './products-table';

export function ProductsListView() {
  const { page, limit, sortBy, sortOrder, searchParams, setPage, setLimit } = useTableQueryParams({
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
    defaultLimit: 20,
  });

  const queryFilters: ProductListFilterParams = {
    page,
    limit,
    sortBy: sortBy as 'createdAt' | 'name' | 'mrp' | 'updatedAt',
    sortOrder: sortOrder as 'asc' | 'desc',
    q: searchParams.get('q') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    status: (searchParams.get('status') as ProductStatus) || undefined,
    inStock: searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : undefined,
  };

  const { data, isLoading, error, refetch } = useAdminProductsQuery(queryFilters);

  const products = data?.data || [];
  const pagination = data?.meta?.pagination;
  const total = pagination?.totalItems ?? products.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your catalog items, variants, pricing, and media slots"
        actions={
          <PermissionGate permissions={['product:create']}>
            <Link href="/admin/products/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </Button>
            </Link>
          </PermissionGate>
        }
      />

      <ProductsFilterBar />

      {error ? (
        <ErrorState
          title="Failed to load products"
          message={error instanceof Error ? error.message : 'An error occurred while fetching products'}
          onRetry={() => refetch()}
        />
      ) : (
        <ProductsTable
          products={products}
          total={total}
          page={page}
          limit={limit}
          isLoading={isLoading}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
}

