'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit2, ImageOff, Star, Trash2, CheckCircle2, Archive, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { DateText } from '@/components/shared/date-text';
import { MoneyText } from '@/components/shared/money-text';
import { StatusBadge } from '@/components/shared/status-badge';
import { PermissionGate } from '@/components/shared/permission-gate';
import { DataTable, type ColumnDef } from '@/components/tables/data-table';
import {
  useDeleteProductMutation,
  useToggleProductFeaturedMutation,
  useUpdateProductStatusMutation,
} from '../hooks/use-products-queries';
import type { AdminProductDto, ProductStatus } from '../types/products.types';

export interface ProductsTableProps {
  products: AdminProductDto[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function ProductsTable({
  products,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
}: ProductsTableProps) {
  const [productToDelete, setProductToDelete] = useState<AdminProductDto | null>(null);

  const deleteMutation = useDeleteProductMutation();
  const statusMutation = useUpdateProductStatusMutation();
  const featuredMutation = useToggleProductFeaturedMutation();

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteMutation.mutateAsync(productToDelete.id);
      setProductToDelete(null);
    } catch {
      // Handled by query mutation error state / toast
    }
  };

  const handleStatusChange = (product: AdminProductDto, newStatus: ProductStatus) => {
    if (product.status === newStatus) return;
    statusMutation.mutate({ id: product.id, status: newStatus });
  };

  const handleToggleFeatured = (product: AdminProductDto) => {
    featuredMutation.mutate({ id: product.id, isFeatured: !product.isFeatured });
  };

  const columns: ColumnDef<AdminProductDto & Record<string, unknown>>[] = [
    {
      key: 'product',
      header: 'Product',
      render: row => {
        const primaryImage =
          row.images?.find(img => img.isPrimary || img.slot === 'THUMBNAIL') ||
          row.images?.[0];
        const primarySku = row.variants?.[0]?.sku || 'No SKU';

        return (
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
              {primaryImage?.url ? (
                <Image
                  src={primaryImage.url}
                  alt={row.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <ImageOff className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 max-w-xs">
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/admin/products/${row.id}`}
                  className="font-medium text-foreground hover:text-primary transition-colors truncate"
                  title={row.name}
                >
                  {row.name}
                </Link>
                {row.isFeatured && (
                  <span
                    className="inline-flex items-center text-amber-500 shrink-0"
                    title="Featured Product"
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                <span>SKU: {primarySku}</span>
                <span>•</span>
                <span>{row.variants?.length || 0} variant{(row.variants?.length || 0) === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      render: row => {
        const catName = row.category?.name || 'Unassigned';
        const subName = row.subcategory?.name;
        return (
          <div className="text-xs text-foreground">
            <span>{catName}</span>
            {subName && (
              <span className="text-muted-foreground"> &gt; {subName}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'pricing',
      header: 'Price (BDT)',
      render: row => {
        const sellingPrice = row.pricing?.sellingPrice || row.variants?.[0]?.price || '0';
        const mrp = row.pricing?.mrp;
        const hasDiscount = mrp && Number(mrp) > Number(sellingPrice);

        return (
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-foreground">
              <MoneyText amount={sellingPrice} />
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-muted-foreground line-through">
                <MoneyText amount={mrp} />
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: row => {
        const statusMap: Record<ProductStatus, 'success' | 'warning' | 'neutral'> = {
          ACTIVE: 'success',
          DRAFT: 'neutral',
          ARCHIVED: 'warning',
        };
        return (
          <div className="flex items-center gap-1.5">
            <StatusBadge
              status={row.status.toLowerCase()}
              variant={statusMap[row.status] || 'neutral'}
            />
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: row => (
        <span className="text-xs text-muted-foreground">
          <DateText date={row.createdAt} format="date" />
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: row => {
        return (
          <div className="flex items-center justify-end gap-1">
            {/* Toggle Featured */}
            <PermissionGate permissions={['product:update']}>
              <button
                type="button"
                onClick={() => handleToggleFeatured(row)}
                title={row.isFeatured ? 'Unmark Featured' : 'Mark as Featured'}
                disabled={featuredMutation.isPending}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  row.isFeatured
                    ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                aria-label={`Toggle featured for ${row.name}`}
              >
                <Star
                  className={`h-4 w-4 ${
                    row.isFeatured ? 'fill-amber-400 text-amber-500' : ''
                  }`}
                />
              </button>
            </PermissionGate>

            {/* Quick Status Toggle */}
            <PermissionGate permissions={['product:publish']}>
              {row.status === 'DRAFT' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(row, 'ACTIVE')}
                  title="Publish Product (Make Active)"
                  disabled={statusMutation.isPending}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer"
                  aria-label={`Publish ${row.name}`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}
              {row.status === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(row, 'ARCHIVED')}
                  title="Archive Product"
                  disabled={statusMutation.isPending}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer"
                  aria-label={`Archive ${row.name}`}
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}
              {row.status === 'ARCHIVED' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(row, 'DRAFT')}
                  title="Revert to Draft"
                  disabled={statusMutation.isPending}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label={`Revert ${row.name} to Draft`}
                >
                  <FileText className="h-4 w-4" />
                </button>
              )}
            </PermissionGate>

            {/* Edit link */}
            <PermissionGate permissions={['product:update']}>
              <Link
                href={`/admin/products/${row.id}`}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Edit Product"
                aria-label={`Edit ${row.name}`}
              >
                <Edit2 className="h-4 w-4" />
              </Link>
            </PermissionGate>

            {/* Delete button */}
            <PermissionGate permissions={['product:delete']}>
              <button
                type="button"
                onClick={() => setProductToDelete(row)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Delete Product"
                aria-label={`Delete ${row.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </PermissionGate>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        data={products as (AdminProductDto & Record<string, unknown>)[]}
        columns={columns}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        emptyTitle="No products found"
        emptyDescription="Try adjusting your search or filters to find what you're looking for."
        emptyAction={
          <PermissionGate permissions={['product:create']}>
            <Link href="/admin/products/new">
              <Button size="sm">Create First Product</Button>
            </Link>
          </PermissionGate>
        }
      />

      <ConfirmDialog
        open={Boolean(productToDelete)}
        onOpenChange={open => !open && setProductToDelete(null)}
        title="Delete Product"
        description={
          <div>
            Are you sure you want to delete{' '}
            <strong className="text-foreground">{productToDelete?.name}</strong>?
            This will soft-delete the product and remove it from the customer storefront.
          </div>
        }
        confirmLabel="Delete Product"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}

