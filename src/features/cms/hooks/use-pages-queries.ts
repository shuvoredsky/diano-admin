import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  publishPage,
  unpublishPage,
  listPageRevisions,
  restorePageRevision,
} from '../api/pages.api';
import type {
  PageFilterParams,
  CreatePageInput,
  UpdatePageInput,
} from '../types/pages.types';

export const PAGES_QUERY_KEY = ['cms', 'pages'] as const;

export function usePagesQuery(params?: PageFilterParams) {
  return useQuery({
    queryKey: [...PAGES_QUERY_KEY, params],
    queryFn: () => listPages(params),
  });
}

export function usePageDetailQuery(id?: string) {
  return useQuery({
    queryKey: [...PAGES_QUERY_KEY, 'detail', id],
    queryFn: () => (id ? getPageById(id) : null),
    enabled: !!id,
  });
}

export function usePageRevisionsQuery(id?: string) {
  return useQuery({
    queryKey: [...PAGES_QUERY_KEY, 'revisions', id],
    queryFn: () => (id ? listPageRevisions(id) : []),
    enabled: !!id,
  });
}

export function useCreatePageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePageInput) => createPage(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY });
    },
  });
}

export function useUpdatePageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePageInput }) => updatePage(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY });
    },
  });
}

export function useDeletePageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY });
    },
  });
}

export function usePublishPageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY });
    },
  });
}

export function useUnpublishPageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unpublishPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY });
    },
  });
}

export function useRestorePageRevisionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => restorePageRevision(id, version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY });
    },
  });
}
