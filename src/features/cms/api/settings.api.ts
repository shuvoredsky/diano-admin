import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  SettingGroup,
  LogoUploadResponse,
  FaviconUploadResponse,
} from '../types/settings.types';

export async function fetchSettingGroup<T>(group: SettingGroup): Promise<T> {
  const res = await api.get<ApiSuccessResponse<T>>(`/settings/${group}`);
  return res.data.data;
}

export async function updateSettingGroup<T>(group: SettingGroup, payload: Partial<T>): Promise<T> {
  const res = await api.patch<ApiSuccessResponse<T>>(`/settings/${group}`, payload);
  return res.data.data;
}

export async function uploadStoreLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('logo', file);
  const res = await api.post<ApiSuccessResponse<LogoUploadResponse>>('/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.logoUrl;
}

export async function uploadStoreFavicon(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('favicon', file);
  const res = await api.post<ApiSuccessResponse<FaviconUploadResponse>>('/settings/favicon', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.faviconUrl;
}
