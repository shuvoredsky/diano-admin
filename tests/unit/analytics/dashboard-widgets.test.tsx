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

describe('Dashboard Widgets, Permissions, and Isolated Failures', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    mockReplace.mockReset();
    mockSearchParams = new URLSearchParams();
  });

  describe('KPI Cards Grid', () => {
    it('renders all 12 KPI cards with correct values and compare indicators', () => {
      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
        user: undefined,
        permissions: ['analytics:view', 'analytics:view_finance'],
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
          <KpiGrid data={mockOverviewData} compare={true} />
        </AppProviders>
      );

      expect(screen.getByText('Gross Sales')).toBeInTheDocument();
      expect(screen.getByText('Net Sales')).toBeInTheDocument();
      expect(screen.getByText('Delivered Sales')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('Average Order Value')).toBeInTheDocument();
      expect(screen.getByText('Items Sold')).toBeInTheDocument();
      expect(screen.getByText('Cancellation Rate')).toBeInTheDocument();
      expect(screen.getByText('Return Rate')).toBeInTheDocument();
      expect(screen.getByText('Active Customers')).toBeInTheDocument();
      expect(screen.getByText('Repeat Customer Rate')).toBeInTheDocument();
      expect(screen.getByText('Gross Profit')).toBeInTheDocument();
      expect(screen.getByText('Net Profit')).toBeInTheDocument();

      // Check formatted BDT
      expect(screen.getByText('৳ 150,000.00')).toBeInTheDocument();
    });

    it('protects finance KPI cards (Gross/Net Profit) when analytics:view_finance is missing', () => {
      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
        user: undefined,
        permissions: ['analytics:view'],
        roles: ['staff'],
        isSuperAdmin: false,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: (perm) => perm !== 'analytics:view_finance',
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
      });

      render(
        <AppProviders>
          <KpiGrid data={mockOverviewData} compare={true} />
        </AppProviders>
      );

      // Gross and Net Profit must show Restricted Access, never ৳0.00
      const restrictedBadges = screen.getAllByText('Restricted Access');
      expect(restrictedBadges.length).toBe(2);
      expect(screen.queryByText('৳ 55,000.00')).not.toBeInTheDocument();
      expect(screen.queryByText('৳ 38,000.00')).not.toBeInTheDocument();
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
      fireEvent.click(retryButtons[0]);
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

