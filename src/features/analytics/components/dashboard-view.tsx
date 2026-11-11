'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PermissionGate } from '@/components/shared/permission-gate';
import { DashboardPeriodSelector } from './dashboard-period-selector';
import { KpiGrid } from './kpi-grid';
import { SalesTrendChart } from './charts/sales-trend-chart';
import { OrderStatusChart } from './charts/order-status-chart';
import { ShipmentStatusChart } from './charts/shipment-status-chart';
import { StockSubcategoryChart } from './charts/stock-subcategory-chart';
import { RecentOrdersCard } from './lists/recent-orders-card';
import { LowStockCard } from './lists/low-stock-card';
import { TopProductsCard } from './lists/top-products-card';
import { useDashboardPeriod } from '../hooks/use-dashboard-period';
import { useDashboardRealtime } from '../hooks/use-dashboard-realtime';
import {
  useAnalyticsOverviewQuery,
  useAnalyticsChartQuery,
  useAnalyticsProductsQuery,
  useRecentOrdersQuery,
  useLowStockQuery,
} from '../hooks/use-analytics-queries';
import type {
  SalesTrendPoint,
  OrderStatusPoint,
  ShipmentStatusPoint,
  StockBySubcategoryPoint,
} from '../types/analytics.types';
import { RefreshCw } from 'lucide-react';
import { DateText } from '@/components/shared/date-text';

export function DashboardView() {
  const { period, compare, from, to } = useDashboardPeriod();
  const { lastRefreshedAt, manualRefresh } = useDashboardRealtime();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryParams = { period, from, to, compare };
  const chartParams = { period, from, to };

  // 1. Overview KPIs
  const overviewQuery = useAnalyticsOverviewQuery(queryParams);

  // 2. Charts (Parallel, isolated error states)
  const salesTrendQuery = useAnalyticsChartQuery<SalesTrendPoint>('sales-trend', chartParams);
  const orderStatusQuery = useAnalyticsChartQuery<OrderStatusPoint>('order-status-pie', chartParams);
  const shipmentStatusQuery = useAnalyticsChartQuery<ShipmentStatusPoint>('shipment-status', chartParams);
  const stockSubcategoryQuery = useAnalyticsChartQuery<StockBySubcategoryPoint>('stock-by-subcategory', chartParams);

  // 3. Operational Lists
  const productsQuery = useAnalyticsProductsQuery(chartParams);
  const recentOrdersQuery = useRecentOrdersQuery(5);
  const lowStockQuery = useLowStockQuery(5);

  const handleRefreshClick = async () => {
    try {
      setIsRefreshing(true);
      await manualRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Global Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PageHeader
          title="Executive Overview"
          description="Real-time KPI performance, sales analytics, and fulfillment tracking."
          className="pb-0"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors shadow-2xs disabled:opacity-60 cursor-pointer"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            <span>Refresh</span>
          </button>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-xl border border-border/40">
            <span>Updated:</span>
            <DateText date={lastRefreshedAt} format="time" />
          </div>
        </div>
      </div>

      {/* Dhaka-Aware Period Selector & Comparison Switch */}
      <DashboardPeriodSelector />

      {/* 12 KPI Metric Cards Grid */}
      <section aria-labelledby="kpi-metrics-heading">
        <h2 id="kpi-metrics-heading" className="sr-only">Key Performance Indicators</h2>
        <KpiGrid
          data={overviewQuery.data}
          loading={overviewQuery.isLoading}
          error={overviewQuery.isError ? (overviewQuery.error as Error).message : null}
          compare={compare}
          onRetry={() => overviewQuery.refetch()}
        />
      </section>

      {/* Analytical Charts Grid */}
      <section aria-labelledby="analytics-charts-heading" className="space-y-4">
        <h2 id="analytics-charts-heading" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Trends & Visual Distribution
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SalesTrendChart
            data={salesTrendQuery.data}
            loading={salesTrendQuery.isLoading}
            error={salesTrendQuery.isError ? (salesTrendQuery.error as Error).message : null}
            onRetry={() => salesTrendQuery.refetch()}
          />
          <OrderStatusChart
            data={orderStatusQuery.data}
            loading={orderStatusQuery.isLoading}
            error={orderStatusQuery.isError ? (orderStatusQuery.error as Error).message : null}
            onRetry={() => orderStatusQuery.refetch()}
          />
          <ShipmentStatusChart
            data={shipmentStatusQuery.data}
            loading={shipmentStatusQuery.isLoading}
            error={shipmentStatusQuery.isError ? (shipmentStatusQuery.error as Error).message : null}
            onRetry={() => shipmentStatusQuery.refetch()}
          />
          <StockSubcategoryChart
            data={stockSubcategoryQuery.data}
            loading={stockSubcategoryQuery.isLoading}
            error={stockSubcategoryQuery.isError ? (stockSubcategoryQuery.error as Error).message : null}
            onRetry={() => stockSubcategoryQuery.refetch()}
          />
        </div>
      </section>

      {/* Operational Tracking Lists */}
      <section aria-labelledby="operational-lists-heading" className="space-y-4">
        <h2 id="operational-lists-heading" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Operational Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <PermissionGate permission="order:read">
            <RecentOrdersCard
              orders={recentOrdersQuery.data}
              loading={recentOrdersQuery.isLoading}
              error={recentOrdersQuery.isError ? (recentOrdersQuery.error as Error).message : null}
              onRetry={() => recentOrdersQuery.refetch()}
            />
          </PermissionGate>

          <PermissionGate permission="inventory:read">
            <LowStockCard
              items={lowStockQuery.data}
              loading={lowStockQuery.isLoading}
              error={lowStockQuery.isError ? (lowStockQuery.error as Error).message : null}
              onRetry={() => lowStockQuery.refetch()}
            />
          </PermissionGate>

          <PermissionGate permission="analytics:view">
            <TopProductsCard
              products={productsQuery.data?.top10SellingByRevenue}
              loading={productsQuery.isLoading}
              error={productsQuery.isError ? (productsQuery.error as Error).message : null}
              onRetry={() => productsQuery.refetch()}
            />
          </PermissionGate>
        </div>
      </section>
    </div>
  );
}

