import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  ReportsManager,
  OrdersReportTab,
  SalesReportTab,
  FinancialReportTab,
} from '@/features/reports';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as ReportsQueriesModule from '@/features/reports/hooks/use-reports-queries';

const mockExportMutateAsync = vi.fn();

vi.mock('@/features/reports/hooks/use-reports-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof ReportsQueriesModule>();
  return {
    ...actual,
    useReportExportMutation: vi.fn(() => ({
      mutateAsync: mockExportMutateAsync,
      isPending: false,
    })),
    useOrdersReportSummaryQuery: vi.fn(() => ({
      data: { totalOrders: 154, deliveredOrders: 120, averageOrderValue: '2850.50' },
      isLoading: false,
      isError: false,
    })),
    useSalesReportSummaryQuery: vi.fn(() => ({
      data: { grossSales: '450000.00', discounts: '25000.00', netSales: '425000.00', shippingFees: '18500.00' },
      isLoading: false,
      isError: false,
    })),
    useInventoryReportSummaryQuery: vi.fn(() => ({
      data: { totalProducts: 342, totalStockUnits: 8400, available: 7900, reserved: 450, damaged: 50 },
      isLoading: false,
      isError: false,
    })),
    useCustomersReportSummaryQuery: vi.fn(() => ({
      data: { totalCustomers: 1250, activeCustomers: 480, avgOrdersPerCustomer: 2.8 },
      isLoading: false,
      isError: false,
    })),
    useFinancialReportSummaryQuery: vi.fn(() => ({
      data: {
        cards: {
          grossSales: { current: '450000.00' },
          deliveredSales: { current: '400000.00' },
          netSales: { current: '425000.00' },
        },
      },
      isLoading: false,
      isError: false,
    })),
  };
});

function setupPermissions(permissions: string[], isSuperAdmin = false) {
  vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
    permissions,
    isSuperAdmin,
    roles: isSuperAdmin ? ['ADMIN'] : ['STAFF'],
    user: { id: 'usr-admin', email: 'admin@diano.com', name: 'Admin', roles: ['ADMIN'] },
    hasPermission: (perm: string) => isSuperAdmin || permissions.includes(perm),
    hasAnyPermission: (perms: string[]) => isSuperAdmin || perms.some((p) => permissions.includes(p)),
    hasAllPermissions: (perms: string[]) => isSuperAdmin || perms.every((p) => permissions.includes(p)),
    isLoading: false,
    isAuthenticated: true,
  });
}

describe('Phase 8B: Reports & Data Export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupPermissions(['report:export', 'analytics:view_finance'], true);
  });

  describe('1. Reports Manager & Tab Navigation', () => {
    it('renders all 5 real report domain tabs and BG-07 coverage notice', () => {
      render(
        <AppProviders>
          <ReportsManager />
        </AppProviders>
      );

      expect(screen.getByText('Backend Data Export Coverage (BG-07)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /orders report/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sales revenue report/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /inventory valuation report/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /customers cohort report/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /financial statement report/i })).toBeInTheDocument();
    });

    it('switches tabs and mounts respective domain configurations', () => {
      render(
        <AppProviders>
          <ReportsManager />
        </AppProviders>
      );

      // Default is Orders
      expect(screen.getByText('Orders Export Parameters')).toBeInTheDocument();

      // Click Sales tab
      fireEvent.click(screen.getByRole('button', { name: /sales revenue report/i }));
      expect(screen.getByText('Sales Revenue Export Parameters')).toBeInTheDocument();

      // Click Inventory tab
      fireEvent.click(screen.getByRole('button', { name: /inventory valuation report/i }));
      expect(screen.getByText('Inventory Valuation Parameters')).toBeInTheDocument();
    });
  });

  describe('2. Live API Snapshot & Pure MoneyText Display', () => {
    it('renders orders summary values directly from API without client manipulation', () => {
      render(
        <AppProviders>
          <OrdersReportTab />
        </AppProviders>
      );

      expect(screen.getByText('154')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('2,850.50')).toBeInTheDocument();
    });

    it('renders sales revenue figures with MoneyText', () => {
      render(
        <AppProviders>
          <SalesReportTab />
        </AppProviders>
      );

      expect(screen.getByText('450,000.00')).toBeInTheDocument();
      expect(screen.getByText('25,000.00')).toBeInTheDocument();
      expect(screen.getByText('425,000.00')).toBeInTheDocument();
    });
  });

  describe('3. Authenticated Blob Export & Error-in-Blob Handling', () => {
    it('dispatches export mutation with selected format and period', async () => {
      render(
        <AppProviders>
          <OrdersReportTab />
        </AppProviders>
      );

      const downloadBtn = screen.getByRole('button', { name: /download orders/i });
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(mockExportMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            format: 'csv',
            period: 'this_month',
          })
        );
      });
    });

    it('displays error banner when backend export fails or returns error JSON in blob', async () => {
      mockExportMutateAsync.mockRejectedValueOnce(
        new Error('Export request exceeds 50,000 records. Please select a shorter date range.')
      );

      render(
        <AppProviders>
          <OrdersReportTab />
        </AppProviders>
      );

      const downloadBtn = screen.getByRole('button', { name: /download orders/i });
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(
          screen.getByText('Export request exceeds 50,000 records. Please select a shorter date range.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('4. Financial Report Permission Gate', () => {
    it('restricts financial tab access when user lacks analytics:view_finance permission', () => {
      setupPermissions(['report:export'], false);

      render(
        <AppProviders>
          <FinancialReportTab />
        </AppProviders>
      );

      expect(screen.getByText('Restricted Financial Access')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /download financials/i })).not.toBeInTheDocument();
    });

    it('grants financial statement export when user has analytics:view_finance permission', () => {
      setupPermissions(['report:export', 'analytics:view_finance'], false);

      render(
        <AppProviders>
          <FinancialReportTab />
        </AppProviders>
      );

      expect(screen.getByText('Financial Statement Parameters')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download financials/i })).toBeInTheDocument();
    });
  });
});
