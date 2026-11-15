import type { DhakaPeriodOption } from '@/lib/utils/dhaka-period';

export type ReportDomain = 'orders' | 'sales' | 'inventory' | 'customers' | 'financial';

export type ReportFormat = 'csv' | 'xlsx' | 'pdf';

export interface OrdersReportExportInput {
  format: ReportFormat;
  period?: DhakaPeriodOption;
  from?: string;
  to?: string;
  status?: string;
  paymentMethod?: 'COD' | 'SSLCOMMERZ';
}

export interface SalesReportExportInput {
  format: 'csv' | 'xlsx';
  period?: DhakaPeriodOption;
  from?: string;
  to?: string;
  group_by?: 'day' | 'week' | 'month';
}

export interface InventoryReportExportInput {
  format: 'csv' | 'xlsx';
  warehouseId?: string;
  categoryId?: string;
  lowStockOnly?: boolean;
}

export interface CustomersReportExportInput {
  format: 'csv' | 'xlsx';
  minOrders?: number;
  district?: string;
}

export interface FinancialReportExportInput {
  format: ReportFormat;
  period?: DhakaPeriodOption;
  from?: string;
  to?: string;
}

export interface OrdersReportSummary {
  totalOrders?: number;
  count?: number;
  deliveredOrders?: number;
  completed?: number;
  averageOrderValue?: string | number;
}

export interface SalesReportSummary {
  grossSales?: string;
  discounts?: string;
  netSales?: string;
  shippingFees?: string;
  shipping?: string;
}

export interface InventoryReportSummary {
  totalProducts?: number;
  totalStockUnits?: number;
  available?: number;
  reserved?: number;
  damaged?: number;
}

export interface CustomersReportSummary {
  totalCustomers?: number;
  total?: number;
  activeCustomers?: number;
  repeatCustomers?: number;
  avgOrdersPerCustomer?: number;
}

export interface FinancialReportSummary {
  cards?: {
    grossSales?: { current?: string };
    deliveredSales?: { current?: string };
    netSales?: { current?: string };
  };
  grossSales?: string;
  deliveredSales?: string;
  netSales?: string;
}
