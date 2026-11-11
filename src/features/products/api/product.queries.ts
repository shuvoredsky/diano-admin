import { queryOptions } from '@tanstack/react-query';

import { PRODUCT_QUERY_KEYS } from '../constants/product.constants';
import type { ProductListFilterParams } from '../types/product.types';
import { getAdminProductById, getAdminProducts } from './product.api';

export const adminProductsQueryOptions = (params: ProductListFilterParams = {}) =>
  queryOptions({
    queryKey: PRODUCT_QUERY_KEYS.list(params),
    queryFn: ({ signal }) => getAdminProducts(params, signal),
  });

export const adminProductDetailQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: PRODUCT_QUERY_KEYS.detail(productId),
    queryFn: ({ signal }) => getAdminProductById(productId, signal),
    enabled: Boolean(productId),
  });

