import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  ReturnsTable,
  ReturnsFilterBar,
  ReturnDetailModal,
  ReturnInspectModal,
  ReturnActionsSection,
  type ReturnRequestEntity,
} from '@/features/returns';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as ReturnsQueriesModule from '@/features/returns/hooks/use-returns-queries';

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
  usePathname: () => '/admin/returns',
  useSearchParams: () => mockSearchParams,
}));

let currentMockReturn: ReturnRequestEntity | null = null;
const mockReviewReturnMutateAsync = vi.fn();
const mockReceiveReturnMutateAsync = vi.fn();

vi.mock('@/features/returns/hooks/use-returns-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof ReturnsQueriesModule>();
  return {
    ...actual,
    useReturnDetailQuery: vi.fn((id?: string) => {
      if (!id || !currentMockReturn) {
        return { data: null, isLoading: false, isError: false, error: null, refetch: vi.fn() };
      }
      return {
        data: currentMockReturn,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    }),
    useReviewReturnMutation: vi.fn(() => ({
      mutateAsync: mockReviewReturnMutateAsync,
      isPending: false,
    })),
    useReceiveReturnMutation: vi.fn(() => ({
      mutateAsync: mockReceiveReturnMutateAsync,
      isPending: false,
    })),
  };
});

const mockReturnItem: ReturnRequestEntity = {
  id: 'ret-101',
  returnNumber: 'RET-202611-0001',
  orderId: 'ord-1001',
  customerId: 'cust-101',
  status: 'REQUESTED',
  refundAmount: '2400.00',
  reasonId: 'rs-defective',
  customerNote: 'Fabric torn along the left sleeve upon unboxing.',
  staffNote: null,
  requestedAt: '2026-11-13T10:00:00.000Z',
  inspectedAt: null,
  completedAt: null,
  createdAt: '2026-11-13T10:00:00.000Z',
  updatedAt: '2026-11-13T10:00:00.000Z',
  order: {
    id: 'ord-1001',
    orderNumber: 'ORD-202611-0001',
    status: 'DELIVERED',
  },
  customer: {
    id: 'cust-101',
    name: 'Tamim Iqbal',
    email: 'tamim@example.com',
    phone: '01711000111',
  },
  items: [
    {
      id: 'rit-1',
      returnRequestId: 'ret-101',
      orderItemId: 'oit-1',
      quantity: 1,
      condition: null,
      action: null,
      createdAt: '2026-11-13T10:00:00.000Z',
      orderItem: {
        id: 'oit-1',
        productName: 'Premium Panjabi Oxford Navy',
        variantName: 'Navy / L',
        sku: 'PAN-NAVY-L',
        unitPrice: '2400.00',
        quantity: 1,
        lineTotal: '2400.00',
      },
    },
  ],
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

describe('Phase 7B: Returns & RMA Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockPush.mockClear();
    mockReplace.mockClear();
    currentMockReturn = { ...mockReturnItem };
    setupPermissions(['return:read', 'return:manage'], true);
  });

  describe('1. Returns Table', () => {
    it('renders return requests with return number, customer, and items count', () => {
      render(
        <AppProviders>
          <ReturnsTable
            returns={[mockReturnItem]}
            isLoading={false}
            onViewDetail={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('#RET-202611-0001')).toBeInTheDocument();
      expect(screen.getByText('Tamim Iqbal')).toBeInTheDocument();
      expect(screen.getByText('#ORD-202611-0001')).toBeInTheDocument();
    });
  });

  describe('2. Return Detail Modal', () => {
    it('renders return request details and customer reason', () => {
      render(
        <AppProviders>
          <ReturnDetailModal
            returnId="ret-101"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText(/Return Request #RET-202611-0001/i)).toBeInTheDocument();
      expect(screen.getByText(/Fabric torn along the left sleeve upon unboxing/i)).toBeInTheDocument();
      expect(screen.getByText('Premium Panjabi Oxford Navy')).toBeInTheDocument();
      expect(screen.getByText(/PAN-NAVY-L/i)).toBeInTheDocument();
    });
  });

  describe('3. Return Operational Decisions (Approve / Reject)', () => {
    it('approves a requested return via ConfirmDialog', async () => {
      render(
        <AppProviders>
          <ReturnActionsSection returnRequest={mockReturnItem} />
        </AppProviders>
      );

      const approveBtn = screen.getByRole('button', { name: /approve return request/i });
      fireEvent.click(approveBtn);

      const confirmBtn = screen.getByRole('button', { name: /approve return/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockReviewReturnMutateAsync).toHaveBeenCalledWith({
          id: 'ret-101',
          input: {
            action: 'APPROVE',
            staffNote: undefined,
          },
        });
      });
    });

    it('requires mandatory rejection reason when rejecting a return', async () => {
      render(
        <AppProviders>
          <ReturnActionsSection returnRequest={mockReturnItem} />
        </AppProviders>
      );

      const rejectBtn = screen.getByRole('button', { name: /reject return request/i });
      fireEvent.click(rejectBtn);

      const confirmRejectBtn = screen.getByRole('button', { name: /reject return/i });
      fireEvent.click(confirmRejectBtn);

      expect(mockReviewReturnMutateAsync).not.toHaveBeenCalled();

      // Enter rejection reason
      const reasonInput = screen.getByPlaceholderText(/enter mandatory rejection reason/i);
      fireEvent.change(reasonInput, { target: { value: 'Item washed and tag removed.' } });
      fireEvent.click(confirmRejectBtn);

      await waitFor(() => {
        expect(mockReviewReturnMutateAsync).toHaveBeenCalledWith({
          id: 'ret-101',
          input: {
            action: 'REJECT',
            staffNote: 'Item washed and tag removed.',
          },
        });
      });
    });
  });

  describe('4. Return Items Inspection (Receive & Inspect)', () => {
    it('submits inspection decisions with condition and processing action', async () => {
      render(
        <AppProviders>
          <ReturnInspectModal
            isOpen={true}
            onClose={vi.fn()}
            returnRequest={mockReturnItem}
          />
        </AppProviders>
      );

      const submitBtn = screen.getByRole('button', { name: /complete inspection/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockReceiveReturnMutateAsync).toHaveBeenCalledWith({
          id: 'ret-101',
          input: {
            items: [
              {
                itemId: 'rit-1',
                condition: 'GOOD',
                action: 'REFUND',
              },
            ],
            staffNote: undefined,
            includeShippingRefund: false,
          },
        });
      });
    });
  });

  describe('5. Filter Bar & URL-param State Sync', () => {
    it('renders search and status from URL query params and triggers navigation on change', () => {
      mockSearchParams = new URLSearchParams('search=RET-202611&status=APPROVED');

      render(
        <AppProviders>
          <ReturnsFilterBar />
        </AppProviders>
      );

      const searchInput = screen.getByPlaceholderText(/search by return #, order #/i);
      expect(searchInput).toHaveValue('RET-202611');

      const select = screen.getByLabelText(/filter by return status/i);
      expect(select).toHaveValue('APPROVED');

      fireEvent.change(searchInput, { target: { value: 'RET-NEW' } });
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('search=RET-NEW'), { scroll: false });

      fireEvent.change(select, { target: { value: 'REJECTED' } });
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('status=REJECTED'), { scroll: false });
    });
  });

  describe('6. Permission Gates', () => {
    it('hides operational action buttons for unprivileged staff', () => {
      setupPermissions(['return:read'], false);

      render(
        <AppProviders>
          <ReturnActionsSection returnRequest={mockReturnItem} />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /approve return request/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reject return request/i })).not.toBeInTheDocument();
    });
  });
});

