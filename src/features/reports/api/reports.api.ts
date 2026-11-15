import { api } from '@/lib/api/browser-client';
import type {
  ReportDomain,
  OrdersReportExportInput,
  SalesReportExportInput,
  InventoryReportExportInput,
  CustomersReportExportInput,
  FinancialReportExportInput,
  OrdersReportSummary,
  SalesReportSummary,
  InventoryReportSummary,
  CustomersReportSummary,
  FinancialReportSummary,
} from '../types/reports.types';

/**
 * Downloads a generated report from the backend via authenticated binary blob stream.
 * Inspects returned blob; if it represents an API error JSON (e.g. 400, 403, 413, 500),
 * parses the message and throws a structured Error rather than downloading corrupt files.
 */
export async function downloadReportFile(
  domain: ReportDomain,
  payload:
    | OrdersReportExportInput
    | SalesReportExportInput
    | InventoryReportExportInput
    | CustomersReportExportInput
    | FinancialReportExportInput
): Promise<void> {
  try {
    const res = await api.post<Blob>(`/admin/reports/${domain}`, payload, {
      responseType: 'blob',
    });

    const blob = res.data;

    // Check if error JSON was received inside blob
    if (blob.type && blob.type.includes('json')) {
      const text = await blob.text();
      let errorMsg = 'Failed to generate report export';
      try {
        const parsed = JSON.parse(text);
        errorMsg = parsed?.error?.message || parsed?.message || errorMsg;
      } catch {
        // Fallback to generic message
      }
      throw new Error(errorMsg);
    }

    // Trigger browser download via object URL
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const format = payload.format || 'csv';
    link.download = `diano-${domain}-report-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('An unexpected error occurred while downloading the report', { cause: err });
  }
}

// Preview / summary data loaders from real backend analytics endpoints
export async function fetchOrdersReportSummary(
  period?: string,
  from?: string,
  to?: string
): Promise<OrdersReportSummary> {
  const params: Record<string, string> = {};
  if (period) params.period = period;
  if (from) params.from = from;
  if (to) params.to = to;
  const res = await api.get<OrdersReportSummary>('/admin/analytics/orders', { params });
  return res.data;
}

export async function fetchSalesReportSummary(
  period?: string,
  from?: string,
  to?: string
): Promise<SalesReportSummary> {
  const params: Record<string, string> = {};
  if (period) params.period = period;
  if (from) params.from = from;
  if (to) params.to = to;
  const res = await api.get<SalesReportSummary>('/admin/analytics/revenue', { params });
  return res.data;
}

export async function fetchInventoryReportSummary(): Promise<InventoryReportSummary> {
  const res = await api.get<InventoryReportSummary>('/inventory/summary');
  return res.data;
}

export async function fetchCustomersReportSummary(
  period?: string
): Promise<CustomersReportSummary> {
  const params: Record<string, string> = {};
  if (period) params.period = period;
  const res = await api.get<CustomersReportSummary>('/admin/analytics/customers', { params });
  return res.data;
}

export async function fetchFinancialReportSummary(
  period?: string,
  from?: string,
  to?: string
): Promise<FinancialReportSummary> {
  const params: Record<string, string> = {};
  if (period) params.period = period;
  if (from) params.from = from;
  if (to) params.to = to;
  const res = await api.get<FinancialReportSummary>('/admin/analytics/overview', { params });
  return res.data;
}
