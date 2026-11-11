import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type { ProductListFilterParams, ProductSummaryItem } from '../types/product.types';

/**
 * Fetches paginated admin product catalog from GET /api/v1/products/admin.
 */
export async function getAdminProducts(
  params: ProductListFilterParams = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<ProductSummaryItem[]>> {
  return api.get<ProductSummaryItem[]>('/products/admin', {
    params,
    signal,
  });
}

/**
 * Fetches a single admin product by ID from GET /api/v1/products/admin/:id.
 */
export async function getAdminProductById(
  productId: string,
  signal?: AbortSignal
): Promise<ProductSummaryItem> {
  const response = await api.get<ProductSummaryItem>(`/products/admin/${productId}`, { signal });
  return response.data;
}
