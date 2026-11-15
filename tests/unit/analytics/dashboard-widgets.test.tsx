import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AppProviders } from '@/components/providers/app-providers';
import { KpiGrid } from '@/features/analytics/components/kpi-grid';
import { DashboardPeriodSelector } from '@/features/analytics/components/dashboard-period-selector';
import { SalesTrendChart } from '@/features/analytics/components/charts/sales-trend-chart';
import { RecentOrdersCard } from '@/features/analytics/components/lists/recent-orders-card';
import { LowStockCard } from '@/features/analytics/components/lists/low-stock-card';
import { TopProductsCard } from '@/features/analytics/components/lists/top-products-card';
import * as authPermissionsHook from '@/features/auth/hooks/use-auth-permissions';
import type { AnalyticsOverviewData } from '@/features/analytics/types/analytics.types';

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/admin',
}));

vi.mock('recharts', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
}));

const mockOverviewData: AnalyticsOverviewData = {
  period: 'this_month',
  range: { start: '2026-11-01T00:00:00.000Z', end: '2026-11-30T23:59:59.999Z' },
  comparisonRange: { start: '2026-10-01T00:00:00.000Z', end: '2026-10-31T23:59:59.999Z' },
  cards: {
    grossSales: { current: 150000, previous: 120000, change: 30000, percent: 25, trend: 'UP', unit: 'currency' },
    netSales: { current: 140000, previous: 110000, change: 30000, percent: 27.3, trend: 'UP', unit: 'currency' },
    deliveredSales: { current: 130000, previous: 100000, change: 30000, percent: 30, trend: 'UP', unit: 'currency' },
    totalOrders: { current: 320, previous: 280, change: 40, percent: 14.3, trend: 'UP', unit: 'count' },
    aov: { current: 437.5, previous: 392.8, change: 44.7, percent: 11.4, trend: 'UP', unit: 'currency' },
    itemsSold: { current: 750, previous: 620, change: 130, percent: 21, trend: 'UP', unit: 'count' },
    cancellationRate: { current: 3.5, previous: 4.2, change: -0.7, percent: -16.7, trend: 'DOWN', unit: 'percent' },
    returnRate: { current: 1.8, previous: 2.1, change: -0.3, percent: -14.3, trend: 'DOWN', unit: 'percent' },
    customerCount: { current: 280, previous: 230, change: 50, percent: 21.7, trend: 'UP', unit: 'count' },
    repeatCustomerRate: { current: 28.5, previous: 24.1, change: 4.4, percent: 18.3, trend: 'UP', unit: 'percent' },
    grossProfit: { current: 55000, previous: 42000, change: 13000, percent: 31, trend: 'UP', unit: 'currency' },
    netProfit: { current: 38000, previous: 29000, change: 9000, percent: 31, trend: 'UP', unit: 'currency' },
    undeliveredOrdersCount: { current: 15, previous: 18, change: -3, percent: -16.7, trend: 'DOWN', unit: 'count' },
  },
};

const mockInventorySummary = {
  totalProducts: 45,
  totalStockUnits: 1250,
  available: 1100,
  reserved: 100,
  damaged: 50,
  stockValue: '1500000.00',
  damageValue: '60000.00',
  netStockValue: '1440000.00',
};

const mockRevenueData = {
  period: 'this_month' as const,
  grossSales: 150000,
  discounts: {
    total: 10000,
    itemDiscounts: 4000,
    couponDiscounts: 5000,
    flashSaleDiscounts: 1000,
  },
  refunds: 2000,
  shippingRevenue: 5000,
  taxRevenue: 0,
  netSales: 140000,
};

describe('Dashboard Widgets, Permissions, and Isolated Failures', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    mockReplace.mockReset();
    mockSearchParams = new URLSearchParams();
  });

  describe('KPI Cards Grid', () => {
    it('renders all 12 required KPI cards with correct values and compare indicators', () => {
      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
        user: undefined,
        permissions: ['analytics:view', 'inventory:view_cost'],
        roles: ['admin'],
        isSuperAdmin: true,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: () => true,
        hasAnyPermission: () => true,
        hasAllPermissions: () => true,
      });

      render(
        <AppProviders>
          <KpiGrid
            data={mockOverviewData}
            revenueData={mockRevenueData}
            inventorySummary={mockInventorySummary}
            compare={true}
          />
        </AppProviders>
      );

      // The 12 required KPI cards
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('Undelivered Orders')).toBeInTheDocument();
      expect(screen.getByText('Delivered Sales')).toBeInTheDocument();
      expect(screen.getByText('Gross Sales')).toBeInTheDocument();
      expect(screen.getByText('Discounts')).toBeInTheDocument();
      expect(screen.getByText('Net Sales')).toBeInTheDocument();
      expect(screen.getByText('Total Products')).toBeInTheDocument();
      expect(screen.getByText('Total Stock Units')).toBeInTheDocument();
      expect(screen.getByText('Stock Value')).toBeInTheDocument();
      expect(screen.getByText('Damaged Quantity')).toBeInTheDocument();
      expect(screen.getByText('Damage Value')).toBeInTheDocument();
      expect(screen.getByText('Net Stock Value')).toBeInTheDocument();

      // Check formatted BDT
      expect(screen.getByText('৳ 150,000.00')).toBeInTheDocument();
      expect(screen.getByText('৳ 10,000.00')).toBeInTheDocument();
      expect(screen.getByText('৳ 1,500,000.00')).toBeInTheDocument();
    });

    it('protects cost KPI cards (Stock/Damage/Net Stock Value) when inventory:view_cost is missing', () => {
      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
        user: undefined,
        permissions: ['analytics:view'],
        roles: ['staff'],
        isSuperAdmin: false,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: (perm) => perm !== 'inventory:view_cost',
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
      });

      render(
        <AppProviders>
          <KpiGrid
            data={mockOverviewData}
            revenueData={mockRevenueData}
            inventorySummary={mockInventorySummary}
            compare={true}
          />
        </AppProviders>
      );

      // 3 cost cards must show Restricted Access, never ৳0.00
      const restrictedBadges = screen.getAllByText('Restricted Access');
      expect(restrictedBadges.length).toBe(3);
      expect(screen.queryByText('৳ 1,500,000.00')).not.toBeInTheDocument();
      expect(screen.queryByText('৳ 60,000.00')).not.toBeInTheDocument();
    });

    it('renders error state on KPI grid without crashing and allows retry', () => {
      const mockRetry = vi.fn();

      render(
        <AppProviders>
          <KpiGrid error="Failed to fetch overview metrics" onRetry={mockRetry} />
        </AppProviders>
      );

      const retryButtons = screen.getAllByRole('button', { name: /Retry/i });
      expect(retryButtons.length).toBeGreaterThan(0);
      if (retryButtons[0]) {
        fireEvent.click(retryButtons[0]);
      }
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe('Dashboard Period Selector & URL Search Param Sync', () => {
    it('updates URL search parameters when period changes', () => {
      render(
        <AppProviders>
          <DashboardPeriodSelector />
        </AppProviders>
      );

      const select = screen.getByLabelText(/Select reporting period/i);
      fireEvent.change(select, { target: { value: 'today' } });

      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('period=today'), { scroll: false });
    });

    it('provides all 11 period options in selector including week and year options', () => {
      render(
        <AppProviders>
          <DashboardPeriodSelector />
        </AppProviders>
      );

      const select = screen.getByLabelText(/Select reporting period/i);
      expect(screen.getByRole('option', { name: 'This Week' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Last Week' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'This Year' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Last Year' })).toBeInTheDocument();

      fireEvent.change(select, { target: { value: 'this_week' } });
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('period=this_week'), { scroll: false });
    });

    it('toggles compare parameter between true and false', () => {
      render(
        <AppProviders>
          <DashboardPeriodSelector />
        </AppProviders>
      );

      const toggleButton = screen.getByLabelText(/Toggle comparison to previous period/i);
      fireEvent.click(toggleButton);

      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('compare=false'), { scroll: false });
    });
  });

  describe('Isolated Widget Failures & Chart Rendering', () => {
    it('SalesTrendChart displays error state without crashing and provides retry', () => {
      const mockRetry = vi.fn();
      render(
        <AppProviders>
          <SalesTrendChart error="Network timeout" onRetry={mockRetry} />
        </AppProviders>
      );

      expect(screen.getByText('Sales & Revenue Trend')).toBeInTheDocument();
      expect(screen.getByText('Network timeout')).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /Retry/i });
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalled();
    });

    it('RecentOrdersCard renders empty state when zero orders exist', () => {
      render(
        <AppProviders>
          <RecentOrdersCard orders={[]} />
        </AppProviders>
      );

      expect(screen.getByText('No recent orders')).toBeInTheDocument();
    });

    it('LowStockCard renders empty state when stock levels are healthy', () => {
      render(
        <AppProviders>
          <LowStockCard items={[]} />
        </AppProviders>
      );

      expect(screen.getByText('All stock levels healthy')).toBeInTheDocument();
    });

    it('TopProductsCard renders product items when data is provided', () => {
      render(
        <AppProviders>
          <TopProductsCard
            products={[
              { productId: 'p1', productName: 'Premium Panjabi', sku: 'PANJ-001', quantitySold: 45, revenue: 112500 },
            ]}
          />
        </AppProviders>
      );

      expect(screen.getByText('Premium Panjabi')).toBeInTheDocument();
      expect(screen.getByText('PANJ-001')).toBeInTheDocument();
      expect(screen.getByText('45 sold')).toBeInTheDocument();
      expect(screen.getByText('112,500.00')).toBeInTheDocument();
    });
  });
});

