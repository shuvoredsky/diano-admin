'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthPermissions } from '@/features/auth/hooks';
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  updateCategoryStatus,
  uploadCategoryImage,
  updateSpecificationTemplate,
} from '../api/categories.api';
import type {
  CategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  ReorderCategoryItem,
  SpecificationField,
} from '../types/categories.types';

export function useCategoriesQuery() {
  const { hasPermission } = useAuthPermissions();
  const canRead = hasPermission('category:read');

  return useQuery<CategoryItem[]>({
    queryKey: ['categories', 'admin'],
    queryFn: fetchAdminCategories,
    staleTime: 60_000,
    enabled: canRead,
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<CategoryItem, Error, CreateCategoryPayload>({
    mutationFn: (payload) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'form-options'] });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<CategoryItem, Error, { id: string; payload: UpdateCategoryPayload }>({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<CategoryItem, Error, { id: string; reassignToId?: string }>({
    mutationFn: ({ id, reassignToId }) => deleteCategory(id, reassignToId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useReorderCategoriesMutation() {
  const queryClient = useQueryClient();

  return useMutation<CategoryItem[], Error, ReorderCategoryItem[]>({
    mutationFn: (items) => reorderCategories(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategoryStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<CategoryItem, Error, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) => updateCategoryStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUploadCategoryImageMutation() {
  const queryClient = useQueryClient();

  return useMutation<CategoryItem, Error, { id: string; file: File }>({
    mutationFn: ({ id, file }) => uploadCategoryImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateSpecTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation<CategoryItem, Error, { id: string; template: SpecificationField[] }>({
    mutationFn: ({ id, template }) => updateSpecificationTemplate(id, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

