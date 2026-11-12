import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSupplier,
  deleteSupplier,
  fetchSupplierById,
  fetchSuppliers,
  updateSupplier,
} from '../api/suppliers.api';
import type {
  CreateSupplierPayload,
  SupplierFilterQuery,
  UpdateSupplierPayload,
} from '../types/suppliers.types';

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (filter: SupplierFilterQuery) => [...supplierKeys.lists(), filter] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
};

export function useSuppliersQuery(filter: SupplierFilterQuery = {}) {
  return useQuery({
    queryKey: supplierKeys.list(filter),
    queryFn: ({ signal }) => fetchSuppliers(filter, signal),
  });
}

export function useSupplierByIdQuery(id?: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id || ''),
    queryFn: ({ signal }) => fetchSupplierById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCreateSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSupplierPayload) => createSupplier(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
}

export function useUpdateSupplierMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSupplierPayload) => updateSupplier(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
}

export function useDeleteSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
}

