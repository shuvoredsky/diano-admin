import { api } from '@/lib/api/browser-client';
import type {
  AnalyticsOverviewData,
  AnalyticsPeriod,
  AnalyticsProductsData,
  LowStockItem,
  RecentOrderItem,
} from '../types/analytics.types';

export interface AnalyticsQueryParams {
  period: AnalyticsPeriod;
  from?: string;
  to?: string;
  compare?: boolean;
}

export async function fetchAnalyticsOverview(
  params: AnalyticsQueryParams
): Promise<AnalyticsOverviewData> {
  const search = new URLSearchParams();
  search.set('period', params.period);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.compare !== undefined) search.set('compare', String(params.compare));

  const response = await api.get<AnalyticsOverviewData>(
    `/admin/analytics/overview?${search.toString()}`
  );
  return response.data;
}

export async function fetchAnalyticsChart<T = unknown>(
  type: string,
  params: AnalyticsQueryParams
): Promise<T[]> {
  const search = new URLSearchParams();
  search.set('period', params.period);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);

  const response = await api.get<T[]>(
    `/admin/analytics/charts/${type}?${search.toString()}`
  );
  return response.data;
}

export async function fetchAnalyticsProducts(
  params: AnalyticsQueryParams
): Promise<AnalyticsProductsData> {
  const search = new URLSearchParams();
  search.set('period', params.period);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);

  const response = await api.get<AnalyticsProductsData>(
    `/admin/analytics/products?${search.toString()}`
  );
  return response.data;
}

export async function fetchLowStockItems(limit = 5): Promise<LowStockItem[]> {
  const response = await api.get<{ items: LowStockItem[]; total: number }>(
    `/inventory/low-stock?page=1&limit=${limit}`
  );
  return response.data?.items ?? [];
}

export async function fetchRecentOrders(limit = 5): Promise<RecentOrderItem[]> {
  const response = await api.get<RecentOrderItem[]>(
    `/admin/orders?page=1&limit=${limit}&sortBy=placedAt&sortOrder=desc`
  );
  return response.data ?? [];
}

