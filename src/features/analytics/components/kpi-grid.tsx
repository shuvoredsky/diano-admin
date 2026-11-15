'use client';

import { KpiCard, type KpiPastel } from '@/components/shared/kpi-card';
import { useAuthPermissions } from '@/features/auth/hooks';
import type {
  AnalyticsOverviewData,
  AnalyticsRevenueResponse,
  KpiCardData,
} from '../types/analytics.types';
import type { InventorySummaryDto } from '@/features/inventory/types/inventory.types';
import {
  ShoppingCart,
  Clock,
  Truck,
  DollarSign,
  Tag,
  TrendingUp,
  Layers,
  Package,
  BadgeDollarSign,
  AlertTriangle,
  XCircle,
  PieChart,
} from 'lucide-react';

export interface KpiGridProps {
  data?: AnalyticsOverviewData;
  revenueData?: AnalyticsRevenueResponse;
  inventorySummary?: InventorySummaryDto;
  loading?: boolean;
  inventoryLoading?: boolean;
  error?: string | null;
  compare?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function KpiGrid({
  data,
  revenueData,
  inventorySummary,
  loading = false,
  inventoryLoading = false,
  error = null,
  compare = true,
  onRetry,
  className,
}: KpiGridProps) {
  const { hasPermission } = useAuthPermissions();
  const canViewCost = hasPermission('inventory:view_cost');

  const cards = data?.cards;

  const kpis: Array<{
    id: string;
    title: string;
    field?: KpiCardData<number> | null;
    rawCurrent?: number | string | null;
    isCurrency?: boolean;
    unit?: string;
    pastel: KpiPastel;
    icon: React.ReactNode;
    requiresCost?: boolean;
    isSnapshot?: boolean;
    note?: string;
  }> = [
    // 1. Total Orders
    {
      id: 'total-orders',
      title: 'Total Orders',
      field: cards?.totalOrders,
      unit: 'orders',
      pastel: 'lavender',
      icon: <ShoppingCart className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    },
    // 2. Undelivered Orders
    {
      id: 'undelivered-orders',
      title: 'Undelivered Orders',
      field: cards?.undeliveredOrdersCount,
      unit: 'orders',
      pastel: 'peach',
      icon: <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    },
    // 3. Delivered Sales
    {
      id: 'delivered-sales',
      title: 'Delivered Sales',
      field: cards?.deliveredSales,
      isCurrency: true,
      pastel: 'sky',
      icon: <Truck className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
    },
    // 4. Gross Sales
    {
      id: 'gross-sales',
      title: 'Gross Sales',
      field: cards?.grossSales,
      isCurrency: true,
      pastel: 'default',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
    },
    // 5. Discounts
    {
      id: 'discounts',
      title: 'Discounts',
      rawCurrent: revenueData?.discounts?.total ?? null,
      isCurrency: true,
      pastel: 'peach',
      icon: <Tag className="h-4 w-4 text-rose-600 dark:text-rose-400" />,
      note: 'Coupons & campaign discounts',
    },
    // 6. Net Sales
    {
      id: 'net-sales',
      title: 'Net Sales',
      field: cards?.netSales,
      isCurrency: true,
      pastel: 'softgreen',
      icon: <TrendingUp className="h-4 w-4 text-primary-deep dark:text-primary" />,
    },
    // 7. Total Products
    {
      id: 'total-products',
      title: 'Total Products',
      rawCurrent: inventorySummary?.totalProducts ?? null,
      unit: 'products',
      pastel: 'default',
      icon: <Layers className="h-4 w-4 text-muted-foreground" />,
      isSnapshot: true,
      note: 'Catalog variants',
    },
    // 8. Total Stock Units
    {
      id: 'total-stock-units',
      title: 'Total Stock Units',
      rawCurrent: inventorySummary?.totalStockUnits ?? null,
      unit: 'units',
      pastel: 'sky',
      icon: <Package className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
      isSnapshot: true,
      note: 'On-hand inventory units',
    },
    // 9. Stock Value
    {
      id: 'stock-value',
      title: 'Stock Value',
      rawCurrent: inventorySummary?.stockValue !== undefined ? Number(inventorySummary.stockValue) : null,
      isCurrency: true,
      pastel: 'softgreen',
      icon: <BadgeDollarSign className="h-4 w-4 text-primary-deep dark:text-primary" />,
      requiresCost: true,
      isSnapshot: true,
      note: 'Cost valuation of stock',
    },
    // 10. Damaged Quantity
    {
      id: 'damaged-qty',
      title: 'Damaged Quantity',
      rawCurrent: inventorySummary?.damaged ?? null,
      unit: 'units',
      pastel: 'peach',
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
      isSnapshot: true,
      note: 'Marked defective units',
    },
    // 11. Damage Value
    {
      id: 'damage-value',
      title: 'Damage Value',
      rawCurrent: inventorySummary?.damageValue !== undefined ? Number(inventorySummary.damageValue) : null,
      isCurrency: true,
      pastel: 'peach',
      icon: <XCircle className="h-4 w-4 text-destructive" />,
      requiresCost: true,
      isSnapshot: true,
      note: 'Cost of damaged units',
    },
    // 12. Net Stock Value
    {
      id: 'net-stock-value',
      title: 'Net Stock Value',
      rawCurrent: inventorySummary?.netStockValue !== undefined ? Number(inventorySummary.netStockValue) : null,
      isCurrency: true,
      pastel: 'lavender',
      icon: <PieChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      requiresCost: true,
      isSnapshot: true,
      note: 'Effective asset valuation',
    },
  ];

  return (
    <div
      className={
        className ||
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
      }
    >
      {kpis.map((kpi) => {
        const isCostRestricted = Boolean(kpi.requiresCost && !canViewCost);
        const isLoadingCard = kpi.isSnapshot ? inventoryLoading : loading;

        let currentVal: number | string | null = null;
        let previousVal: number | string | null = null;
        let percentVal: number | null = null;
        let trendVal: 'UP' | 'DOWN' | 'FLAT' | 'NONE' = 'NONE';

        if (isCostRestricted) {
          currentVal = null;
        } else if (kpi.field) {
          currentVal = kpi.field.current;
          previousVal = compare ? kpi.field.previous : null;
          percentVal = compare ? kpi.field.percent : null;
          trendVal = compare ? (kpi.field.trend as 'UP' | 'DOWN' | 'FLAT' | 'NONE') : 'NONE';
        } else if (kpi.rawCurrent !== undefined) {
          currentVal = kpi.rawCurrent;
        }

        return (
          <KpiCard
            key={kpi.id}
            title={kpi.title}
            current={currentVal}
            previous={kpi.isSnapshot ? null : previousVal}
            percent={kpi.isSnapshot ? null : percentVal}
            trend={kpi.isSnapshot ? 'NONE' : trendVal}
            unit={kpi.unit}
            isCurrency={kpi.isCurrency}
            pastel={kpi.pastel}
            icon={kpi.icon}
            note={kpi.note}
            loading={isLoadingCard}
            error={error}
            isRestricted={isCostRestricted}
            onRetry={onRetry}
          />
        );
      })}
    </div>
  );
}
