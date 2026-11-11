export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface ProductListFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  categoryId?: string;
  isFeatured?: boolean;
}

export interface ProductSummaryItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  status: ProductStatus;
  basePrice: string;
  salePrice: string | null;
  stockQuantity: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

