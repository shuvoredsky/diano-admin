import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listBanners,
  getBannerById,
  createBanner,
  updateBanner,
  toggleBannerActive,
  deleteBanner,
  reorderBanners,
} from '../api/banners.api';
import type {
  BannerFilterParams,
  CreateBannerInput,
  UpdateBannerInput,
  BannerReorderItem,
} from '../types/banners.types';

export const BANNERS_QUERY_KEY = ['cms', 'banners'] as const;

export function useBannersQuery(params?: BannerFilterParams) {
  return useQuery({
    queryKey: [...BANNERS_QUERY_KEY, params],
    queryFn: () => listBanners(params),
  });
}

export function useBannerDetailQuery(id?: string) {
  return useQuery({
    queryKey: [...BANNERS_QUERY_KEY, 'detail', id],
    queryFn: () => (id ? getBannerById(id) : null),
    enabled: !!id,
  });
}

export function useCreateBannerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBannerInput) => createBanner(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
    },
  });
}

export function useUpdateBannerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBannerInput }) => updateBanner(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
    },
  });
}

export function useToggleBannerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleBannerActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
    },
  });
}

export function useDeleteBannerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
    },
  });
}

export function useReorderBannersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: BannerReorderItem[]) => reorderBanners(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNERS_QUERY_KEY });
    },
  });
}
