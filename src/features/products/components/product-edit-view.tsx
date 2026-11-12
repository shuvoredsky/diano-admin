'use client';

import { useAdminProductByIdQuery } from '../hooks/use-products-queries';
import { ProductForm } from './form/product-form';
import { ErrorState } from '@/components/feedback/error-state';
import { Skeleton } from '@/components/feedback/skeletons';

export interface ProductEditViewProps {
  productId: string;
}

export function ProductEditView({ productId }: ProductEditViewProps) {
  const { data: product, isLoading, error, refetch } = useAdminProductByIdQuery(productId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="h-12 w-full rounded-2xl bg-card border border-border" />
        <div className="h-96 w-full rounded-2xl bg-card border border-border" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <ErrorState
        title="Product not found"
        message={error instanceof Error ? error.message : 'The requested product could not be loaded.'}
        onRetry={() => refetch()}
      />
    );
  }

  return <ProductForm initialProduct={product} isCreateMode={false} />;
}

