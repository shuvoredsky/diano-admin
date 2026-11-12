import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addProductVariant,
  createProduct,
  deleteProduct,
  deleteProductImage,
  deleteProductVariant,
  fetchAdminProductById,
  fetchAdminProductFormOptions,
  fetchAdminProducts,
  reorderProductImages,
  toggleProductFeatured,
  updateProduct,
  updateProductStatus,
  updateProductVariant,
  uploadProductBackview,
  uploadProductGalleryImage,
  uploadProductThumbnail,
} from '../api/products.api';
import type {
  CreateProductPayload,
  CreateVariantPayload,
  ProductImageSlot,
  ProductListFilterParams,
  ProductStatus,
  UpdateProductPayload,
  UpdateVariantPayload,
} from '../types/products.types';

export const productKeys = {
  all: ['products'] as const,
  admin: () => [...productKeys.all, 'admin'] as const,
  lists: () => [...productKeys.admin(), 'list'] as const,
  list: (filters: ProductListFilterParams) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.admin(), 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  formOptions: () => [...productKeys.admin(), 'form-options'] as const,
};

export function useAdminProductsQuery(filters: ProductListFilterParams = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ signal }) => fetchAdminProducts(filters, signal),
  });
}

export function useAdminProductByIdQuery(id?: string) {
  return useQuery({
    queryKey: productKeys.detail(id || ''),
    queryFn: ({ signal }) => fetchAdminProductById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useAdminProductFormOptionsQuery() {
  return useQuery({
    queryKey: productKeys.formOptions(),
    queryFn: ({ signal }) => fetchAdminProductFormOptions(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.admin() });
    },
  });
}

export function useUpdateProductMutation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProductPayload) => updateProduct(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.admin() });
    },
  });
}

export function useUpdateProductStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) =>
      updateProductStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useToggleProductFeaturedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      toggleProductFeatured(id, isFeatured),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useAddProductVariantMutation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVariantPayload) => addProductVariant(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

export function useUpdateProductVariantMutation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      variantId,
      payload,
    }: {
      variantId: string;
      payload: UpdateVariantPayload;
    }) => updateProductVariant(productId, variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

export function useDeleteProductVariantMutation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) => deleteProductVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

export function useUploadProductImageMutation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slot,
      file,
    }: {
      slot: ProductImageSlot;
      file: File;
    }) => {
      if (slot === 'THUMBNAIL') {
        return uploadProductThumbnail(productId, file);
      }
      if (slot === 'BACKVIEW') {
        return uploadProductBackview(productId, file);
      }
      return uploadProductGalleryImage(productId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

export function useDeleteProductImageMutation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => deleteProductImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

export function useReorderProductImagesMutation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; sortOrder: number }[]) =>
      reorderProductImages(productId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

