import type { ReportDomain } from '../types/reports.types';

export const REPORT_DOMAINS: { id: ReportDomain; label: string; description: string }[] = [
  {
    id: 'orders',
    label: 'Orders Report',
    description: 'Detailed order transactions, fulfilment statuses, payment methods, and customer delivery destinations.',
  },
  {
    id: 'sales',
    label: 'Sales Revenue Report',
    description: 'Aggregated gross sales, net sales, promotional discounts, and shipping revenues grouped by time intervals.',
  },
  {
    id: 'inventory',
    label: 'Inventory Valuation Report',
    description: 'Current warehouse stock levels, available units, reserved quantities, damaged units, and reorder levels.',
  },
  {
    id: 'customers',
    label: 'Customers Cohort Report',
    description: 'Customer ordering frequency, total expenditures, geographic distribution, and account creation dates.',
  },
  {
    id: 'financial',
    label: 'Financial Statement Report',
    description: 'Comprehensive financial breakdown, revenue, COGS, operating overheads, and gateway settlement charges.',
  },
];

export const REPORT_ORDER_STATUSES = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Packed', value: 'PACKED' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Returned', value: 'RETURNED' },
  { label: 'Refunded', value: 'REFUNDED' },
];

export const REPORT_PAYMENT_METHODS = [
  { label: 'All Payment Methods', value: '' },
  { label: 'Cash on Delivery (COD)', value: 'COD' },
  { label: 'SSLCOMMERZ Gateway', value: 'SSLCOMMERZ' },
];

export const SALES_GROUP_BY_OPTIONS = [
  { label: 'Daily Breakdown', value: 'day' },
  { label: 'Weekly Summary', value: 'week' },
  { label: 'Monthly Summary', value: 'month' },
];

