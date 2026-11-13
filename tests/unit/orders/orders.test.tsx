import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProviders } from '@/components/providers/app-providers';
import * as usePermissionsHook from '@/hooks/use-permissions';
import { OrdersTable } from '@/features/orders/components/orders-table';
import { OrderDetailModal } from '@/features/orders/components/order-detail-modal';
import {
  ORDER_TRANSITION_TABLE,
  isAllowedTransition,
  getRequiredPermissionForTransition,
} from '@/features/orders/constants/orders.constants';
import type { OrderEntity, OrderStatus } from '@/features/orders/types/orders.types';
import * as ordersApi from '@/features/orders/api/orders.api';
import type * as OrdersQueriesModule from '@/features/orders/hooks/use-orders-queries';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin/orders',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock orders query hook
let currentMockOrder: OrderEntity | null = null;
const mockUpdateStatusMutateAsync = vi.fn();
const mockAddNoteMutateAsync = vi.fn();

vi.mock('@/features/orders/hooks/use-orders-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof OrdersQueriesModule>();
  return {
    ...actual,
    useAdminOrderByIdQuery: vi.fn((id?: string) => {
      if (!id || !currentMockOrder) return { data: null, isLoading: false, error: null, refetch: vi.fn() };
      return {
        data: currentMockOrder,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      };
    }),
    useUpdateOrderStatusMutation: vi.fn(() => ({
      mutateAsync: mockUpdateStatusMutateAsync,
      isPending: false,
    })),
    useAddOrderNoteMutation: vi.fn(() => ({
      mutateAsync: mockAddNoteMutateAsync,
      isPending: false,
    })),
  };
});

const mockOrderPending: OrderEntity = {
  id: 'ord-1001',
  orderNumber: 'ORD-202611-0001',
  customerId: 'cust-1',
  status: 'PENDING',
  subtotal: '2500.00',
  discountTotal: '0.00',
  shippingTotal: '120.00',
  taxTotal: '0.00',
  grandTotal: '2620.00',
  paymentStatus: 'PENDING',
  paymentMethod: 'COD',
  placedAt: '2026-11-12T10:00:00.000Z',
  createdAt: '2026-11-12T10:00:00.000Z',
  updatedAt: '2026-11-12T10:00:00.000Z',
  customerSnapshot: {
    id: 'cust-1',
    name: 'Rahim Ahmed',
    phone: '01711000000',
    email: 'rahim@example.com',
    isGuest: false,
  },
  shippingAddressSnapshot: {
    address: 'House 12, Road 5, Dhanmondi',
    area: 'Dhanmondi',
    district: 'Dhaka',
    zoneName: 'Dhaka South',
  },
  items: [
    {
      id: 'item-1',
      productName: 'Executive Cotton Shirt',
      variantName: 'Navy Blue / 16',
      sku: 'SHIRT-COT-NV-16',
      unitPrice: '2500.00',
      costPrice: '1800.00',
      quantity: 1,
      discount: '0.00',
      lineTotal: '2500.00',
    },
  ],
  statusHistory: [
    {
      id: 'hist-1',
      status: 'PENDING',
      createdAt: '2026-11-12T10:00:00.000Z',
      note: 'Order placed by customer via Cash on Delivery',
    },
  ],
  orderNotes: [
    {
      id: 'note-1',
      authorId: 'staff-admin-1',
      note: 'Customer requested evening delivery',
      isCustomerVisible: false,
      createdAt: '2026-11-12T10:05:00.000Z',
    },
  ],
  payments: [
    {
      id: 'pay-1',
      provider: 'COD',
      status: 'PENDING',
      amount: '2620.00',
      currency: 'BDT',
      createdAt: '2026-11-12T10:00:00.000Z',
    },
  ],
  shipments: [],
};

describe('Phase 6A: Orders Management & State Machine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockOrder = { ...mockOrderPending };
  });

  const setupPermissions = (perms: string[], isSuper = true) => {
    vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
      user: undefined,
      roles: isSuper ? ['SUPER_ADMIN'] : ['STAFF'],
      isSuperAdmin: isSuper,
      isLoading: false,
      isAuthenticated: true,
      permissions: perms,
      hasPermission: (slug: string) => perms.includes(slug) || isSuper,
      hasAllPermissions: (slugs: string[]) => slugs.every((s) => perms.includes(s)) || isSuper,
      hasAnyPermission: (slugs: string[]) => slugs.some((s) => perms.includes(s)) || isSuper,
    });
  };

  describe('1. Orders Table', () => {
    it('renders order list with order number, customer, grand total and view details trigger', () => {
      setupPermissions(['order:read']);
      const onViewOrder = vi.fn();

      render(
        <AppProviders>
          <OrdersTable
            data={[mockOrderPending]}
            total={1}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
            onViewOrder={onViewOrder}
          />
        </AppProviders>
      );

      expect(screen.getByText(/ORD-202611-0001/)).toBeInTheDocument();
      expect(screen.getByText('Rahim Ahmed')).toBeInTheDocument();
      expect(screen.getByText(/2,620\.00/)).toBeInTheDocument();

      const viewBtn = screen.getByRole('button', { name: /details/i });
      fireEvent.click(viewBtn);
      expect(onViewOrder).toHaveBeenCalledWith(mockOrderPending);
    });

    it('renders empty state when order list is empty', () => {
      setupPermissions(['order:read']);

      render(
        <AppProviders>
          <OrdersTable
            data={[]}
            total={0}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
            onViewOrder={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText(/no orders found/i)).toBeInTheDocument();
    });
  });

  describe('2. Order Detail Modal', () => {
    it('renders customer details, shipping address, line items, and API financial totals', () => {
      setupPermissions(['order:read', 'order:confirm', 'order:cancel']);

      render(
        <AppProviders>
          <OrderDetailModal orderId="ord-1001" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      // Customer Details
      expect(screen.getAllByText('Rahim Ahmed').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('01711000000').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('rahim@example.com')).toBeInTheDocument();

      // Shipping Destination
      expect(screen.getByText('House 12, Road 5, Dhanmondi')).toBeInTheDocument();
      expect(screen.getByText(/Dhanmondi, Dhaka South, Dhaka/)).toBeInTheDocument();

      // Line items
      expect(screen.getByText('Executive Cotton Shirt')).toBeInTheDocument();
      expect(screen.getByText(/SHIRT-COT-NV-16/)).toBeInTheDocument();

      // Totals strictly from API
      expect(screen.getAllByText(/2,620\.00/).length).toBeGreaterThan(0);
      expect(screen.getByText(/120\.00/)).toBeInTheDocument();

      // Notes
      expect(screen.getByText('Customer requested evening delivery')).toBeInTheDocument();
      expect(screen.getByText('Internal Note')).toBeInTheDocument();
    });
  });

  describe('3. State Machine Transition Verification (ORDER_TRANSITION_TABLE)', () => {
    const stateTransitions: Array<{ from: OrderStatus; allowed: OrderStatus[] }> = [
      { from: 'PENDING', allowed: ['CONFIRMED', 'CANCELLED'] },
      { from: 'CONFIRMED', allowed: ['PROCESSING', 'CANCELLED'] },
      { from: 'PROCESSING', allowed: ['PACKED', 'CANCELLED'] },
      { from: 'PACKED', allowed: ['SHIPPED', 'CANCELLED'] },
      { from: 'SHIPPED', allowed: ['DELIVERED'] },
      { from: 'DELIVERED', allowed: ['RETURNED'] },
      { from: 'RETURNED', allowed: [] },
      { from: 'CANCELLED', allowed: [] },
      { from: 'REFUNDED', allowed: [] },
    ];

    it.each(stateTransitions)(
      'validates ORDER_TRANSITION_TABLE transitions for $from',
      ({ from, allowed }) => {
        expect(ORDER_TRANSITION_TABLE[from]).toEqual(allowed);
        for (const next of allowed) {
          expect(isAllowedTransition(from, next)).toBe(true);
        }
      }
    );

    it('renders only valid next transition buttons for PENDING order', () => {
      setupPermissions(['order:read', 'order:confirm', 'order:cancel'], true);

      render(
        <AppProviders>
          <OrderDetailModal orderId="ord-1001" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      // PENDING order can only be Confirmed or Cancelled
      expect(screen.getByRole('button', { name: /confirm order/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel order/i })).toBeInTheDocument();

      // Non-adjacent buttons must NOT be rendered
      expect(screen.queryByRole('button', { name: /mark packed/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /dispatch/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /mark delivered/i })).not.toBeInTheDocument();
    });

    it('renders only valid next transition buttons for SHIPPED order (cannot cancel once shipped)', () => {
      currentMockOrder = {
        ...mockOrderPending,
        id: 'ord-shipped',
        status: 'SHIPPED',
      };
      setupPermissions(['order:read', 'order:update_status', 'order:cancel'], true);

      render(
        <AppProviders>
          <OrderDetailModal orderId="ord-shipped" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      // SHIPPED order can only be marked DELIVERED
      expect(screen.getByRole('button', { name: /mark delivered/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel order/i })).not.toBeInTheDocument();
    });

    it('renders no transition buttons for terminal CANCELLED order', () => {
      currentMockOrder = {
        ...mockOrderPending,
        id: 'ord-cancelled',
        status: 'CANCELLED',
      };
      setupPermissions(['order:read', 'order:manage'], true);

      render(
        <AppProviders>
          <OrderDetailModal orderId="ord-cancelled" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel order/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /process/i })).not.toBeInTheDocument();
    });
  });

  describe('4. Permission Gating & Confirmations', () => {
    it('hides mutating action buttons when user lacks transition permissions', () => {
      // User only has order:read
      setupPermissions(['order:read'], false);

      render(
        <AppProviders>
          <OrderDetailModal orderId="ord-1001" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /confirm order/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel order/i })).not.toBeInTheDocument();
    });

    it('verifies permission mapping helper returns correct slug', () => {
      expect(getRequiredPermissionForTransition('CONFIRMED')).toBe('order:confirm');
      expect(getRequiredPermissionForTransition('SHIPPED')).toBe('order:ship');
      expect(getRequiredPermissionForTransition('CANCELLED')).toBe('order:cancel');
      expect(getRequiredPermissionForTransition('PROCESSING')).toBe('order:update_status');
    });

    it('requires cancellation reason when canceling an order in ConfirmDialog', async () => {
      setupPermissions(['order:read', 'order:cancel'], true);

      render(
        <AppProviders>
          <OrderDetailModal orderId="ord-1001" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const cancelBtn = screen.getByRole('button', { name: /cancel order/i });
      fireEvent.click(cancelBtn);

      // Dialog opens
      expect(screen.getByText(/cancellation reason \(required\)/i)).toBeInTheDocument();

      // Clicking confirm without reason shows validation error
      const confirmDialogBtn = screen.getByRole('button', { name: /confirm cancellation/i });
      fireEvent.click(confirmDialogBtn);

      await waitFor(() => {
        expect(screen.getByText('A cancellation reason is required.')).toBeInTheDocument();
      });
      expect(mockUpdateStatusMutateAsync).not.toHaveBeenCalled();

      // Enter cancellation note and confirm
      const reasonInput = screen.getByPlaceholderText(/enter reason for cancellation/i);
      fireEvent.change(reasonInput, { target: { value: 'Customer requested cancellation via phone' } });
      fireEvent.click(confirmDialogBtn);

      await waitFor(() => {
        expect(mockUpdateStatusMutateAsync).toHaveBeenCalledWith({
          id: 'ord-1001',
          input: {
            status: 'CANCELLED',
            note: 'Customer requested cancellation via phone',
          },
        });
      });
    });
  });

  describe('5. Invoice PDF Download & Staff Notes', () => {
    it('calls downloadAdminOrderInvoiceBlob and saves file', async () => {
      setupPermissions(['order:read'], true);
      const mockDownload = vi
        .spyOn(ordersApi, 'downloadAdminOrderInvoiceBlob')
        .mockResolvedValueOnce({
          blob: new Blob(['%PDF-1.4 mock content'], { type: 'application/pdf' }),
          filename: 'Invoice-ORD-202611-0001.pdf',
        });
      const mockSave = vi.spyOn(ordersApi, 'saveBlobAsFile').mockImplementation(() => {});

      render(
        <AppProviders>
          <OrderDetailModal orderId="ord-1001" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const downloadBtn = screen.getByRole('button', { name: /invoice pdf/i });
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(mockDownload).toHaveBeenCalledWith('ord-1001', 'ORD-202611-0001');
        expect(mockSave).toHaveBeenCalled();
      });
    });

    it('submits new order note with isCustomerVisible toggle', async () => {
      setupPermissions(['order:read', 'order:update_status'], true);

      render(
        <AppProviders>
          <OrderDetailModal orderId="ord-1001" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const noteTextarea = screen.getByPlaceholderText(/type order progress update/i);
      fireEvent.change(noteTextarea, { target: { value: 'Packaging confirmed in warehouse shelf B' } });

      const customerVisibleCheck = screen.getByLabelText(/visible to customer/i);
      fireEvent.click(customerVisibleCheck);

      const addNoteBtn = screen.getByRole('button', { name: /add note/i });
      fireEvent.click(addNoteBtn);

      await waitFor(() => {
        expect(mockAddNoteMutateAsync).toHaveBeenCalledWith({
          id: 'ord-1001',
          input: {
            note: 'Packaging confirmed in warehouse shelf B',
            isCustomerVisible: true,
          },
        });
      });
    });

    it('displays error banner when invoice download fails with JSON error payload', async () => {
      setupPermissions(['order:read'], true);
      vi.spyOn(ordersApi, 'downloadAdminOrderInvoiceBlob').mockRejectedValueOnce(
        new Error('Invoice generation failed: order not yet confirmed')
      );

      render(
        <AppProviders>
          <OrderDetailModal orderId="ord-1001" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const downloadBtn = screen.getByRole('button', { name: /invoice pdf/i });
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(
          screen.getByText('Invoice generation failed: order not yet confirmed')
        ).toBeInTheDocument();
      });
    });
  });

  describe('6. Confidential Cost, Fraud Reviews & Blob Error Decoding', () => {
    it('omits / masks costPrice when user lacks order:view_cost permission', () => {
      setupPermissions(['order:read'], false);

      render(
        <AppProviders>
          <OrderDetailModal orderId="ord-1001" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      expect(screen.queryByTestId('th-cost-price')).not.toBeInTheDocument();
      expect(screen.queryByTestId('item-cost-price')).not.toBeInTheDocument();
      expect(screen.queryByText(/1,800\.00/)).not.toBeInTheDocument();
    });

    it('renders costPrice when user has order:view_cost permission', () => {
      setupPermissions(['order:read', 'order:view_cost'], false);

      render(
        <AppProviders>
          <OrderDetailModal orderId="ord-1001" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      expect(screen.getByTestId('th-cost-price')).toBeInTheDocument();
      expect(screen.getByTestId('item-cost-price')).toBeInTheDocument();
      expect(screen.getByText(/1,800\.00/)).toBeInTheDocument();
    });

    it('displays 403 fraud hold review error banner when confirming a fraud-held order', async () => {
      setupPermissions(['order:read', 'order:confirm'], false);
      mockUpdateStatusMutateAsync.mockRejectedValueOnce(
        new Error(
          'Order is held under manual fraud review and cannot be confirmed or shipped until approved by staff.'
        )
      );

      render(
        <AppProviders>
          <OrderDetailModal orderId="ord-1001" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const confirmBtn = screen.getByRole('button', { name: /confirm order/i });
      fireEvent.click(confirmBtn);

      // ConfirmDialog opens
      const confirmDialogBtn = screen.getByRole('button', { name: /mark as confirmed/i });
      fireEvent.click(confirmDialogBtn);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Order is held under manual fraud review and cannot be confirmed or shipped until approved by staff.'
          )
        ).toBeInTheDocument();
      });
    });

    it('unpacks JSON error payload when invoice response is application/json blob', async () => {
      const mockJsonBlob = new Blob(
        [JSON.stringify({ message: 'Order must be confirmed before invoice generation' })],
        { type: 'application/json' }
      );

      vi.spyOn(ordersApi, 'downloadAdminOrderInvoiceBlob').mockImplementationOnce(async () => {
        const text = await mockJsonBlob.text();
        const parsed = JSON.parse(text) as { message?: string };
        throw new Error(parsed.message || 'Failed to download invoice');
      });

      await expect(
        ordersApi.downloadAdminOrderInvoiceBlob('ord-1001', 'ORD-202611-0001')
      ).rejects.toThrow('Order must be confirmed before invoice generation');
    });
  });
});
