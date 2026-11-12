import type { CategoryItem } from '@/features/categories';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type InventoryType = 'READY_STOCK' | 'PRE_ORDER' | 'MADE_TO_ORDER';
export type DiscountType = 'NONE' | 'PERCENTAGE' | 'FIXED';
export type ProductImageSlot = 'THUMBNAIL' | 'BACKVIEW' | 'GALLERY';

export interface ProductPricingDto {
  mrp: string;
  discountType: DiscountType;
  discountValue: string;
  discountAmount: string;
  sellingPrice: string;
  warnings?: string[];
}

export interface ResponsiveImageUrls {
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
}

export interface ProductImageDto {
  id: string;
  slot: ProductImageSlot;
  url: string;
  publicId?: string | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  bytes?: number | null;
  responsiveUrls?: ResponsiveImageUrls;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  variantId: string | null;
}

export interface ProductVariantDto {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  price: string;
  compareAtPrice: string | null;
  costPrice?: string | null;
  attributes: Record<string, unknown>;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategoryId?: string | null;
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  videoUrl: string | null;
  freeShipping: boolean;
  specialOffer: boolean;
  inventoryType: InventoryType;
  specifications: Record<string, unknown>;
  pricing?: ProductPricingDto;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  status: ProductStatus;
  viewCount: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariantDto[];
  images: ProductImageDto[];
  tags: string[];
  relatedProductIds?: string[];
}

export interface ProductListFilterParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'mrp' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  q?: string;
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  inStock?: boolean;
}

export interface CreateVariantPayload {
  name: string;
  sku: string;
  barcode?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  attributes?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateVariantPayload {
  name?: string;
  sku?: string;
  barcode?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  attributes?: Record<string, unknown>;
  isActive?: boolean;
}

export interface CreateProductPayload {
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string | null;
  categoryId: string;
  subcategoryId?: string | null;
  videoUrl?: string | null;
  mrp?: number | null;
  discountType?: DiscountType;
  discountValue?: number | null;
  freeShipping?: boolean;
  specialOffer?: boolean;
  inventoryType?: InventoryType;
  specifications?: Record<string, unknown>;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
  };
  status?: ProductStatus;
  isFeatured?: boolean;
  tags?: string[];
  relatedProductIds?: string[];
  variants: CreateVariantPayload[];
}

export interface UpdateProductPayload {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string | null;
  categoryId?: string;
  subcategoryId?: string | null;
  videoUrl?: string | null;
  mrp?: number | null;
  discountType?: DiscountType;
  discountValue?: number | null;
  freeShipping?: boolean;
  specialOffer?: boolean;
  inventoryType?: InventoryType;
  specifications?: Record<string, unknown>;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
  };
  status?: ProductStatus;
  isFeatured?: boolean;
  tags?: string[];
  relatedProductIds?: string[];
}

export interface ProductFormOptions {
  categories: CategoryItem[];
  inventoryTypes: InventoryType[];
  discountTypes: DiscountType[];
  uploadLimits: {
    maxFileSizeBytes: number;
    allowedMimeTypes: string[];
    maxGalleryImages: number;
  };
  requiredFields: string[];
  videoHostAllowlist: string[];
}

