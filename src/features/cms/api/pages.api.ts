import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  PageEntity,
  PageRevisionEntity,
  CreatePageInput,
  UpdatePageInput,
  PageFilterParams,
} from '../types/pages.types';

export async function listPages(params?: PageFilterParams): Promise<ApiSuccessResponse<PageEntity[]>> {
  const queryParams: Record<string, string | number> = {};
  if (params?.type) queryParams.type = params.type;
  if (params?.status) queryParams.status = params.status;
  if (params?.search) queryParams.search = params.search;
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  const res = await api.get<ApiSuccessResponse<PageEntity[]>>('/pages', { params: queryParams });
  return res.data;
}

export async function getPageById(id: string): Promise<PageEntity> {
  const res = await api.get<PageEntity>(`/pages/${id}`);
  return res.data;
}

export async function createPage(input: CreatePageInput): Promise<PageEntity> {
  const res = await api.post<PageEntity>('/pages', input);
  return res.data;
}

export async function updatePage(id: string, input: UpdatePageInput): Promise<PageEntity> {
  const res = await api.put<PageEntity>(`/pages/${id}`, input);
  return res.data;
}

export async function deletePage(id: string): Promise<void> {
  await api.delete(`/pages/${id}`);
}

export async function publishPage(id: string): Promise<PageEntity> {
  const res = await api.post<PageEntity>(`/pages/${id}/publish`);
  return res.data;
}

export async function unpublishPage(id: string): Promise<PageEntity> {
  const res = await api.post<PageEntity>(`/pages/${id}/unpublish`);
  return res.data;
}

export async function listPageRevisions(id: string): Promise<PageRevisionEntity[]> {
  const res = await api.get<ApiSuccessResponse<PageRevisionEntity[]>>(`/pages/${id}/revisions`);
  return res.data.data;
}

export async function restorePageRevision(id: string, version: number): Promise<PageEntity> {
  const res = await api.post<PageEntity>(`/pages/${id}/revisions/${version}/restore`);
  return res.data;
}
