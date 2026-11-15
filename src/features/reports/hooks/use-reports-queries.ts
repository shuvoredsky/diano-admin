import { useQuery, useMutation } from '@tanstack/react-query';
import {
  downloadReportFile,
  fetchOrdersReportSummary,
  fetchSalesReportSummary,
  fetchInventoryReportSummary,
  fetchCustomersReportSummary,
  fetchFinancialReportSummary,
} from '../api/reports.api';
import type {
  ReportDomain,
  OrdersReportExportInput,
  SalesReportExportInput,
  InventoryReportExportInput,
  CustomersReportExportInput,
  FinancialReportExportInput,
} from '../types/reports.types';

export function useReportExportMutation(domain: ReportDomain) {
  return useMutation({
    mutationFn: (
      payload:
        | OrdersReportExportInput
        | SalesReportExportInput
        | InventoryReportExportInput
        | CustomersReportExportInput
        | FinancialReportExportInput
    ) => downloadReportFile(domain, payload),
  });
}

export function useOrdersReportSummaryQuery(period?: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'orders', 'summary', period, from, to],
    queryFn: () => fetchOrdersReportSummary(period, from, to),
    staleTime: 60_000,
  });
}

export function useSalesReportSummaryQuery(period?: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'sales', 'summary', period, from, to],
    queryFn: () => fetchSalesReportSummary(period, from, to),
    staleTime: 60_000,
  });
}

export function useInventoryReportSummaryQuery() {
  return useQuery({
    queryKey: ['reports', 'inventory', 'summary'],
    queryFn: () => fetchInventoryReportSummary(),
    staleTime: 60_000,
  });
}

export function useCustomersReportSummaryQuery(period?: string) {
  return useQuery({
    queryKey: ['reports', 'customers', 'summary', period],
    queryFn: () => fetchCustomersReportSummary(period),
    staleTime: 60_000,
  });
}

export function useFinancialReportSummaryQuery(period?: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'financial', 'summary', period, from, to],
    queryFn: () => fetchFinancialReportSummary(period, from, to),
    staleTime: 60_000,
  });
}
