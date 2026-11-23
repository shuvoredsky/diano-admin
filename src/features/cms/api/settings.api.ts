import { api } from '@/lib/api/browser-client';
import type {
  SettingGroup,
  LogoUploadResponse,
  FaviconUploadResponse,
} from '../types/settings.types';

interface NestedData<T> {
  data?: T;
}

export async function fetchSettingGroup<T>(group: SettingGroup): Promise<T> {
  const res = await api.get<T>(`/settings/${group}`);
  const payload = res.data as T | NestedData<T>;
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data;
  }
  return payload as T;
}

export async function updateSettingGroup<T>(group: SettingGroup, payload: Partial<T>): Promise<T> {
  const res = await api.patch<T>(`/settings/${group}`, payload);
  const data = res.data as T | NestedData<T>;
  if (data && typeof data === 'object' && 'data' in data && data.data !== undefined) {
    return data.data;
  }
  return data as T;
}

export async function uploadStoreLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('logo', file);
  const res = await api.post<LogoUploadResponse>('/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const data = res.data as LogoUploadResponse | NestedData<LogoUploadResponse>;
  if (data && typeof data === 'object' && 'logoUrl' in data && typeof data.logoUrl === 'string') {
    return data.logoUrl;
  }
  if (data && typeof data === 'object' && 'data' in data && data.data && typeof data.data === 'object' && 'logoUrl' in data.data) {
    return (data.data as LogoUploadResponse).logoUrl;
  }
  return '';
}

export async function uploadStoreFavicon(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('favicon', file);
  const res = await api.post<FaviconUploadResponse>('/settings/favicon', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const data = res.data as FaviconUploadResponse | NestedData<FaviconUploadResponse>;
  if (data && typeof data === 'object' && 'faviconUrl' in data && typeof data.faviconUrl === 'string') {
    return data.faviconUrl;
  }
  if (data && typeof data === 'object' && 'data' in data && data.data && typeof data.data === 'object' && 'faviconUrl' in data.data) {
    return (data.data as FaviconUploadResponse).faviconUrl;
  }
  return '';
}
