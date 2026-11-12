import type { DiscountType, InventoryType, ProductStatus } from '../../types/products.types';

export interface VariantFormData {
  id?: string;
  name: string;
  sku: string;
  barcode?: string;
  price?: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  isActive: boolean;
  attributes?: Record<string, unknown>;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  subcategoryId?: string;
  videoUrl?: string;
  inventoryType: InventoryType;
  freeShipping: boolean;
  specialOffer: boolean;
  isFeatured: boolean;
  status: ProductStatus;
  tagsInput?: string;
  tags: string[];

  // Pricing
  mrp?: number;
  discountType: DiscountType;
  discountValue?: number;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  // Dynamic specifications
  specifications: Record<string, unknown>;

  // Variants (min 1)
  variants: VariantFormData[];
}

