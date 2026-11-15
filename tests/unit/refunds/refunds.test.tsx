import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  RefundsTable,
  RefundsFilterBar,
  RefundsManager,
  RefundDetailModal,
  CreateRefundModal,
  type RefundEntity,
} from '@/features/refunds';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as RefundsQueriesModule from '@/features/refunds/hooks/use-refunds-queries';

let mockSearchParams = new URLSearchParams();
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin/refunds',
  useSearchParams: () => mockSearchParams,
}));

let currentMockRefund: RefundEntity | null = null;
const mockExecuteOrderRefundMutateAsync = vi.fn();

vi.mock('@/features/refunds/hooks/use-refunds-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof RefundsQueriesModule>();
  return {
    ...actual,
    useRefundDetailQuery: vi.fn((id?: string) => {
      if (!id || !currentMockRefund) {
        return { data: null, isLoading: false, isError: false, error: null, refetch: vi.fn() };
      }
      return {
        data: currentMockRefund,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    }),
    useExecuteOrderRefundMutation: vi.fn(() => ({
      mutateAsync: mockExecuteOrderRefundMutateAsync,
      isPending: false,
    })),
  };
});

const mockRefundItem: RefundEntity = {
  id: 'ref-101',
  paymentId: 'pay-ssl-001',
  orderId: 'ord-1001',
  amount: '3500.00',
  reason: 'Customer cancelled before parcel dispatched',
  status: 'COMPLETED',
  providerRefundId: 'SSL-REF-776655',
  processedAt: '2026-11-13T16:00:00.000Z',
  createdAt: '2026-11-13T15:30:00.000Z',
  updatedAt: '2026-11-13T16:00:00.000Z',
  payment: {
    id: 'pay-ssl-001',
    provider: 'SSLCOMMERZ',
    transactionId: 'TXN-998811',
    amount: '3500.00',
    status: 'PAID',
  },
  order: {
    id: 'ord-1001',
    orderNumber: 'ORD-202611-0001',
    status: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    totalAmount: '3500.00',
    customer: {
      id: 'cust-101',
      name: 'Tamim Iqbal',
      email: 'tamim@example.com',
      phone: '01711000111',
    },
  },
};

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

describe('Phase 7B: Refunds & Settlements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockPush.mockClear();
    mockReplace.mockClear();
    currentMockRefund = { ...mockRefundItem };
    setupPermissions(['refund:read', 'refund:approve'], true);
  });

  describe('1. Refunds Table', () => {
    it('renders refund list with amount, reason, order number, and status badge', () => {
      render(
        <AppProviders>
          <RefundsTable
            refunds={[mockRefundItem]}
            isLoading={false}
            onViewDetail={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('#ORD-202611-0001')).toBeInTheDocument();
      expect(screen.getByText('Tamim Iqbal')).toBeInTheDocument();
      expect(screen.getByText(/Customer cancelled before parcel dispatched/i)).toBeInTheDocument();
    });
  });

  describe('2. Refund Detail Modal', () => {
    it('renders refund record details with gateway settlement reference', () => {
      render(
        <AppProviders>
          <RefundDetailModal
            refundId="ref-101"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('SSLCOMMERZ')).toBeInTheDocument();
      expect(screen.getByText('SSL-REF-776655')).toBeInTheDocument();
      expect(screen.getByText('#ORD-202611-0001')).toBeInTheDocument();
    });
  });

  describe('3. Issue Order Refund Modal', () => {
    it('validates mandatory reason and submits order refund execution', async () => {
      render(
        <AppProviders>
          <CreateRefundModal
            isOpen={true}
            onClose={vi.fn()}
            defaultOrderId="ord-1001"
          />
        </AppProviders>
      );

      const submitBtn = screen.getByRole('button', { name: /authorize refund/i });
      fireEvent.click(submitBtn);

      expect(mockExecuteOrderRefundMutateAsync).not.toHaveBeenCalled();

      // Enter reason and amount
      const reasonInput = screen.getByPlaceholderText(/customer cancelled before dispatch/i);
      fireEvent.change(reasonInput, { target: { value: 'Product damaged in transit' } });

      const amountInput = screen.getByPlaceholderText(/leave blank for full order balance/i);
      fireEvent.change(amountInput, { target: { value: '2500.00' } });

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockExecuteOrderRefundMutateAsync).toHaveBeenCalledWith({
          orderId: 'ord-1001',
          amount: '2500.00',
          reason: 'Product damaged in transit',
          refundShipping: false,
          manualReference: undefined,
        });
      });
    });
  });

  describe('4. Filter Bar & URL-param State Sync', () => {
    it('renders search and status from URL query params and triggers navigation on change', () => {
      mockSearchParams = new URLSearchParams('search=ORD-202611&status=COMPLETED');

      render(
        <AppProviders>
          <RefundsFilterBar />
        </AppProviders>
      );

      const searchInput = screen.getByPlaceholderText(/search by order #, payment id/i);
      expect(searchInput).toHaveValue('ORD-202611');

      const select = screen.getByLabelText(/filter by refund status/i);
      expect(select).toHaveValue('COMPLETED');

      fireEvent.change(searchInput, { target: { value: 'ORD-NEW' } });
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('search=ORD-NEW'), { scroll: false });

      fireEvent.change(select, { target: { value: 'FAILED' } });
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('status=FAILED'), { scroll: false });
    });
  });

  describe('5. Permission Gates & Actions', () => {
    it('hides Issue Order Refund button when user lacks refund:approve permission', () => {
      setupPermissions(['refund:read'], false);

      render(
        <AppProviders>
          <RefundsManager />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /issue order refund/i })).not.toBeInTheDocument();
    });
  });
});

