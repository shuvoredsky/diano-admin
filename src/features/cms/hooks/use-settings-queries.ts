import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSettingGroup,
  updateSettingGroup,
  uploadStoreLogo,
  uploadStoreFavicon,
} from '../api/settings.api';
import type {
  SettingGroup,
  StoreProfileSettings,
  InvoiceSettings,
  SeoDefaultsSettings,
  ContactSettings,
} from '../types/settings.types';

export const SETTINGS_QUERY_KEY = ['cms', 'settings'] as const;

export function useStoreProfileQuery() {
  return useQuery({
    queryKey: [...SETTINGS_QUERY_KEY, 'store_profile'],
    queryFn: () => fetchSettingGroup<StoreProfileSettings>('store_profile'),
  });
}

export function useInvoiceSettingsQuery() {
  return useQuery({
    queryKey: [...SETTINGS_QUERY_KEY, 'invoice'],
    queryFn: () => fetchSettingGroup<InvoiceSettings>('invoice'),
  });
}

export function useSeoDefaultsQuery() {
  return useQuery({
    queryKey: [...SETTINGS_QUERY_KEY, 'seo_defaults'],
    queryFn: () => fetchSettingGroup<SeoDefaultsSettings>('seo_defaults'),
  });
}

export function useContactSettingsQuery() {
  return useQuery({
    queryKey: [...SETTINGS_QUERY_KEY, 'contact'],
    queryFn: () => fetchSettingGroup<ContactSettings>('contact'),
  });
}

export function useUpdateSettingsMutation<T>(group: SettingGroup) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<T>) => updateSettingGroup<T>(group, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SETTINGS_QUERY_KEY, group] });
    },
  });
}

export function useUploadLogoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadStoreLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SETTINGS_QUERY_KEY, 'store_profile'] });
    },
  });
}

export function useUploadFaviconMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadStoreFavicon(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SETTINGS_QUERY_KEY, 'store_profile'] });
    },
  });
}
