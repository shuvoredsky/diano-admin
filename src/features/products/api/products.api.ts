import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  AdminProductDto,
  CreateProductPayload,
  CreateVariantPayload,
  ProductFormOptions,
  ProductImageDto,
  ProductListFilterParams,
  ProductStatus,
  ProductVariantDto,
  UpdateProductPayload,
  UpdateVariantPayload,
} from '../types/products.types';

/**
 * Fetches paginated admin product list from GET /products/admin/all
 */
export async function fetchAdminProducts(
  params: ProductListFilterParams = {},
  signal?: AbortSignal
): Promise<ApiSuccessResponse<AdminProductDto[]>> {
  const queryParams: Record<string, unknown> = {};

  if (params.page !== undefined) queryParams.page = params.page;
  if (params.limit !== undefined) queryParams.limit = params.limit;
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
  if (params.q) queryParams.q = params.q.trim();
  if (params.categoryId) queryParams.categoryId = params.categoryId;
  if (params.status) queryParams.status = params.status;
  if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
  if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
  if (params.isFeatured !== undefined) queryParams.isFeatured = params.isFeatured;
  if (params.inStock !== undefined) queryParams.inStock = params.inStock;

  return api.get<AdminProductDto[]>('/products/admin/all', {
    params: queryParams,
    signal,
  });
}

/**
 * Fetches single product details for admin from GET /products/admin/:id
 */
export async function fetchAdminProductById(
  id: string,
  signal?: AbortSignal
): Promise<AdminProductDto> {
  const res = await api.get<AdminProductDto>(`/products/admin/${encodeURIComponent(id)}`, { signal });
  return res.data;
}

/**
 * Fetches product form options from GET /products/admin/form-options
 */
export async function fetchAdminProductFormOptions(
  signal?: AbortSignal
): Promise<ProductFormOptions> {
  const res = await api.get<ProductFormOptions>('/products/admin/form-options', { signal });
  return res.data;
}

/**
 * Creates a new product via POST /products
 */
export async function createProduct(
  payload: CreateProductPayload
): Promise<AdminProductDto> {
  const res = await api.post<AdminProductDto>('/products', payload);
  return res.data;
}

/**
 * Updates an existing product via PATCH /products/:id
 */
export async function updateProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<AdminProductDto> {
  const res = await api.patch<AdminProductDto>(`/products/${encodeURIComponent(id)}`, payload);
  return res.data;
}

/**
 * Soft-deletes a product via DELETE /products/:id
 */
export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${encodeURIComponent(id)}`);
}

/**
 * Updates product publish status via PATCH /products/:id/status
 */
export async function updateProductStatus(
  id: string,
  status: ProductStatus
): Promise<AdminProductDto> {
  const res = await api.patch<AdminProductDto>(`/products/${encodeURIComponent(id)}/status`, {
    status,
  });
  return res.data;
}

/**
 * Toggles product featured flag via PATCH /products/:id/featured
 */
export async function toggleProductFeatured(
  id: string,
  isFeatured: boolean
): Promise<AdminProductDto> {
  const res = await api.patch<AdminProductDto>(`/products/${encodeURIComponent(id)}/featured`, {
    isFeatured,
  });
  return res.data;
}

// ================= Variant Endpoints =================

/**
 * Adds a variant to a product via POST /products/:id/variants
 */
export async function addProductVariant(
  productId: string,
  payload: CreateVariantPayload
): Promise<ProductVariantDto> {
  const res = await api.post<ProductVariantDto>(
    `/products/${encodeURIComponent(productId)}/variants`,
    payload
  );
  return res.data;
}

/**
 * Updates a variant via PATCH /products/:id/variants/:variantId
 */
export async function updateProductVariant(
  productId: string,
  variantId: string,
  payload: UpdateVariantPayload
): Promise<ProductVariantDto> {
  const res = await api.patch<ProductVariantDto>(
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
    payload
  );
  return res.data;
}

/**
 * Deletes a variant via DELETE /products/:id/variants/:variantId
 */
export async function deleteProductVariant(
  productId: string,
  variantId: string
): Promise<void> {
  await api.delete(
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`
  );
}

// ================= Image Slot Endpoints =================

/**
 * Uploads thumbnail image via POST /products/:id/images/thumbnail
 */
export async function uploadProductThumbnail(
  productId: string,
  file: File
): Promise<ProductImageDto> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post<ProductImageDto>(
    `/products/${encodeURIComponent(productId)}/images/thumbnail`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data;
}

/**
 * Uploads backview image via POST /products/:id/images/backview
 */
export async function uploadProductBackview(
  productId: string,
  file: File
): Promise<ProductImageDto> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post<ProductImageDto>(
    `/products/${encodeURIComponent(productId)}/images/backview`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data;
}

/**
 * Uploads single gallery image via POST /products/:id/images/gallery
 */
export async function uploadProductGalleryImage(
  productId: string,
  file: File
): Promise<ProductImageDto> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post<ProductImageDto>(
    `/products/${encodeURIComponent(productId)}/images/gallery`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data;
}

/**
 * Reorders product gallery images via PUT /products/:id/images/reorder
 */
export async function reorderProductImages(
  productId: string,
  items: { id: string; sortOrder: number }[]
): Promise<void> {
  await api.put(`/products/${encodeURIComponent(productId)}/images/reorder`, { items });
}

/**
 * Deletes a product image via DELETE /products/:id/images/:imageId
 */
export async function deleteProductImage(
  productId: string,
  imageId: string
): Promise<void> {
  await api.delete(
    `/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`
  );
}

