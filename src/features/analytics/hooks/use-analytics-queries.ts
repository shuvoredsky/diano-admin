'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthPermissions } from '@/features/auth/hooks';
import {
  fetchAnalyticsOverview,
  fetchAnalyticsChart,
  fetchAnalyticsProducts,
  fetchLowStockItems,
  fetchRecentOrders,
  type AnalyticsQueryParams,
} from '../api/analytics.api';
import type {
  AnalyticsOverviewData,
  AnalyticsProductsData,
  LowStockItem,
  RecentOrderItem,
} from '../types/analytics.types';

export function useAnalyticsOverviewQuery(params: AnalyticsQueryParams) {
  const { hasPermission } = useAuthPermissions();
  const canViewAnalytics = hasPermission('analytics:view');

  return useQuery<AnalyticsOverviewData>({
    queryKey: ['analytics', 'overview', params],
    queryFn: () => fetchAnalyticsOverview(params),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
    enabled: canViewAnalytics,
  });
}

export function useAnalyticsChartQuery<T = unknown>(type: string, params: AnalyticsQueryParams) {
  const { hasPermission } = useAuthPermissions();
  const canViewAnalytics = hasPermission('analytics:view');

  return useQuery<T[]>({
    queryKey: ['analytics', 'chart', type, params],
    queryFn: () => fetchAnalyticsChart<T>(type, params),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
    enabled: canViewAnalytics,
  });
}

export function useAnalyticsProductsQuery(params: AnalyticsQueryParams) {
  const { hasPermission } = useAuthPermissions();
  const canViewAnalytics = hasPermission('analytics:view');

  return useQuery<AnalyticsProductsData>({
    queryKey: ['analytics', 'products', params],
    queryFn: () => fetchAnalyticsProducts(params),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
    enabled: canViewAnalytics,
  });
}

export function useLowStockQuery(limit = 5) {
  const { hasPermission } = useAuthPermissions();
  const canReadInventory = hasPermission('inventory:read');

  return useQuery<LowStockItem[]>({
    queryKey: ['inventory', 'low-stock', limit],
    queryFn: () => fetchLowStockItems(limit),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
    enabled: canReadInventory,
  });
}

export function useRecentOrdersQuery(limit = 5) {
  const { hasPermission } = useAuthPermissions();
  const canReadOrders = hasPermission('order:read');

  return useQuery<RecentOrderItem[]>({
    queryKey: ['orders', 'recent', limit],
    queryFn: () => fetchRecentOrders(limit),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
    enabled: canReadOrders,
  });
}

