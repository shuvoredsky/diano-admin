import { api } from '@/lib/api/browser-client';
import type {
  CategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  ReorderCategoryItem,
  SpecificationField,
} from '../types/categories.types';

export async function fetchAdminCategories(): Promise<CategoryItem[]> {
  const res = await api.get<CategoryItem[]>('/categories/admin/all');
  return res.data || [];
}

export async function fetchCategoryById(id: string): Promise<CategoryItem> {
  const res = await api.get<CategoryItem>(`/categories/admin/${id}`);
  return res.data;
}

export async function createCategory(payload: CreateCategoryPayload): Promise<CategoryItem> {
  const res = await api.post<CategoryItem>('/categories', payload);
  return res.data;
}

export async function updateCategory(id: string, payload: UpdateCategoryPayload): Promise<CategoryItem> {
  const res = await api.patch<CategoryItem>(`/categories/${id}`, payload);
  return res.data;
}

export async function deleteCategory(id: string, reassignToId?: string): Promise<CategoryItem> {
  const url = reassignToId
    ? `/categories/${id}?reassignToId=${encodeURIComponent(reassignToId)}`
    : `/categories/${id}`;
  const res = await api.delete<CategoryItem>(url);
  return res.data;
}

export async function reorderCategories(items: ReorderCategoryItem[]): Promise<CategoryItem[]> {
  const res = await api.put<CategoryItem[]>('/categories/reorder', { items });
  return res.data;
}

export async function updateCategoryStatus(id: string, isActive: boolean): Promise<CategoryItem> {
  const res = await api.patch<CategoryItem>(`/categories/${id}/status`, { isActive });
  return res.data;
}

export async function uploadCategoryImage(id: string, file: File): Promise<CategoryItem> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post<CategoryItem>(`/categories/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function updateSpecificationTemplate(
  id: string,
  template: SpecificationField[]
): Promise<CategoryItem> {
  const res = await api.patch<CategoryItem>(`/categories/${id}/specification-template`, { template });
  return res.data;
}

export interface CategoryProductFormSchemaResponse {
  categoryId: string;
  categoryName: string;
  fields: SpecificationField[];
}

export async function fetchCategoryProductFormSchema(
  id: string,
  signal?: AbortSignal
): Promise<CategoryProductFormSchemaResponse> {
  const res = await api.get<CategoryProductFormSchemaResponse>(
    `/categories/${encodeURIComponent(id)}/product-form-schema`,
    { signal }
  );
  return res.data;
}


