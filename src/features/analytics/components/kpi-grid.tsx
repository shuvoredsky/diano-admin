'use client';

import { KpiCard, type KpiPastel } from '@/components/shared/kpi-card';
import { useAuthPermissions } from '@/features/auth/hooks';
import type { AnalyticsOverviewData } from '../types/analytics.types';
import {
  DollarSign,
  TrendingUp,
  Truck,
  ShoppingCart,
  Receipt,
  Package,
  XCircle,
  RotateCcw,
  Users,
  Repeat,
  BadgeDollarSign,
  PieChart,
} from 'lucide-react';

export interface KpiGridProps {
  data?: AnalyticsOverviewData;
  loading?: boolean;
  error?: string | null;
  compare?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function KpiGrid({
  data,
  loading = false,
  error = null,
  compare = true,
  onRetry,
  className,
}: KpiGridProps) {
  const { hasPermission } = useAuthPermissions();
  const canViewFinance = hasPermission('analytics:view_finance');

  const cards = data?.cards;

  const kpis: Array<{
    id: string;
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: any;
    isCurrency?: boolean;
    unit?: string;
    pastel: KpiPastel;
    icon: React.ReactNode;
    requiresFinance?: boolean;
  }> = [
    {
      id: 'gross-sales',
      title: 'Gross Sales',
      field: cards?.grossSales,
      isCurrency: true,
      pastel: 'default',
      icon: <DollarSign className="h-4 w-4 text-primary" />,
    },
    {
      id: 'net-sales',
      title: 'Net Sales',
      field: cards?.netSales,
      isCurrency: true,
      pastel: 'softgreen',
      icon: <TrendingUp className="h-4 w-4 text-primary-deep dark:text-primary" />,
    },
    {
      id: 'delivered-sales',
      title: 'Delivered Sales',
      field: cards?.deliveredSales,
      isCurrency: true,
      pastel: 'sky',
      icon: <Truck className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
    },
    {
      id: 'total-orders',
      title: 'Total Orders',
      field: cards?.totalOrders,
      unit: 'orders',
      pastel: 'lavender',
      icon: <ShoppingCart className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    },
    {
      id: 'aov',
      title: 'Average Order Value',
      field: cards?.aov,
      isCurrency: true,
      pastel: 'peach',
      icon: <Receipt className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    },
    {
      id: 'items-sold',
      title: 'Items Sold',
      field: cards?.itemsSold,
      unit: 'items',
      pastel: 'default',
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
    },
    {
      id: 'cancellation-rate',
      title: 'Cancellation Rate',
      field: cards?.cancellationRate,
      unit: '%',
      pastel: 'peach',
      icon: <XCircle className="h-4 w-4 text-destructive" />,
    },
    {
      id: 'return-rate',
      title: 'Return Rate',
      field: cards?.returnRate,
      unit: '%',
      pastel: 'lavender',
      icon: <RotateCcw className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    },
    {
      id: 'customer-count',
      title: 'Active Customers',
      field: cards?.customerCount,
      unit: 'customers',
      pastel: 'sky',
      icon: <Users className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
    },
    {
      id: 'repeat-customer-rate',
      title: 'Repeat Customer Rate',
      field: cards?.repeatCustomerRate,
      unit: '%',
      pastel: 'softgreen',
      icon: <Repeat className="h-4 w-4 text-primary-deep dark:text-primary" />,
    },
    {
      id: 'gross-profit',
      title: 'Gross Profit',
      field: cards?.grossProfit,
      isCurrency: true,
      pastel: 'softgreen',
      icon: <BadgeDollarSign className="h-4 w-4 text-primary-deep dark:text-primary" />,
      requiresFinance: true,
    },
    {
      id: 'net-profit',
      title: 'Net Profit',
      field: cards?.netProfit,
      isCurrency: true,
      pastel: 'lavender',
      icon: <PieChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      requiresFinance: true,
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
        const isRestricted = kpi.requiresFinance && !canViewFinance;
        const cardData = kpi.field;

        return (
          <KpiCard
            key={kpi.id}
            title={kpi.title}
            current={isRestricted ? null : cardData?.current}
            previous={compare && !isRestricted ? cardData?.previous : null}
            percent={compare && !isRestricted ? cardData?.percent : null}
            trend={compare && !isRestricted ? cardData?.trend : 'NONE'}
            unit={kpi.unit}
            isCurrency={kpi.isCurrency}
            pastel={kpi.pastel}
            icon={kpi.icon}
            loading={loading}
            error={error}
            isRestricted={isRestricted}
            onRetry={onRetry}
          />
        );
      })}
    </div>
  );
}

