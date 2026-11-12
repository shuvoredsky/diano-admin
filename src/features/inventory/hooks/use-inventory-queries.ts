import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adjustStock,
  approveStockAudit,
  fetchInventoryList,
  fetchInventorySummary,
  fetchLowStockList,
  fetchStockAuditById,
  fetchStockAudits,
  fetchStockMovements,
  markStockDamaged,
  recordAuditCounts,
  rejectStockAudit,
  startStockAudit,
} from '../api/inventory.api';
import type {
  AdjustStockInput,
  AuditCountEntryInput,
  InventoryFilterQuery,
  MarkDamagedInput,
  StartAuditInput,
  StockMovementQueryFilter,
} from '../types/inventory.types';

export const inventoryKeys = {
  all: ['inventory'] as const,
  summary: () => [...inventoryKeys.all, 'summary'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filter: InventoryFilterQuery) => [...inventoryKeys.lists(), filter] as const,
  lowStock: (filter: InventoryFilterQuery) => [...inventoryKeys.all, 'low-stock', filter] as const,
  movements: (filter: StockMovementQueryFilter) => [...inventoryKeys.all, 'movements', filter] as const,
  audits: (warehouseId?: string) => [...inventoryKeys.all, 'audits', warehouseId] as const,
  auditDetail: (id: string) => [...inventoryKeys.all, 'audit', id] as const,
};

export function useInventorySummaryQuery() {
  return useQuery({
    queryKey: inventoryKeys.summary(),
    queryFn: ({ signal }) => fetchInventorySummary(signal),
    staleTime: 30 * 1000,
  });
}

export function useInventoryListQuery(filter: InventoryFilterQuery = {}) {
  return useQuery({
    queryKey: inventoryKeys.list(filter),
    queryFn: ({ signal }) => fetchInventoryList(filter, signal),
  });
}

export function useLowStockQuery(filter: InventoryFilterQuery = {}) {
  return useQuery({
    queryKey: inventoryKeys.lowStock(filter),
    queryFn: ({ signal }) => fetchLowStockList(filter, signal),
  });
}

export function useStockMovementsQuery(filter: StockMovementQueryFilter = {}) {
  return useQuery({
    queryKey: inventoryKeys.movements(filter),
    queryFn: ({ signal }) => fetchStockMovements(filter, signal),
  });
}

export function useAdjustStockMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdjustStockInput) => adjustStock(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useMarkDamagedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MarkDamagedInput) => markStockDamaged(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useStockAuditsQuery(warehouseId?: string) {
  return useQuery({
    queryKey: inventoryKeys.audits(warehouseId),
    queryFn: ({ signal }) => fetchStockAudits(warehouseId, signal),
  });
}

export function useStockAuditByIdQuery(id?: string) {
  return useQuery({
    queryKey: inventoryKeys.auditDetail(id || ''),
    queryFn: ({ signal }) => fetchStockAuditById(id!, signal),
    enabled: Boolean(id),
  });
}

export function useStartStockAuditMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StartAuditInput) => startStockAudit(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.audits() });
    },
  });
}

export function useRecordAuditCountsMutation(auditId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: AuditCountEntryInput[]) => recordAuditCounts(auditId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.auditDetail(auditId) });
    },
  });
}

export function useApproveStockAuditMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (auditId: string) => approveStockAudit(auditId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useRejectStockAuditMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ auditId, reason }: { auditId: string; reason?: string }) =>
      rejectStockAudit(auditId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

