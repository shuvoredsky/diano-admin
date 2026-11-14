import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  PaymentsTable,
  PaymentDetailModal,
  maskTransactionId,
  filterPayloadAllowlist,
  type PaymentListItem,
  type PaymentDetailEntity,
} from '@/features/payments';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as PaymentsQueriesModule from '@/features/payments/hooks/use-payments-queries';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin/payments',
  useSearchParams: () => new URLSearchParams(),
}));

let currentMockPayment: PaymentDetailEntity | null = null;
const mockMarkCodCollectedMutateAsync = vi.fn();

vi.mock('@/features/payments/hooks/use-payments-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof PaymentsQueriesModule>();
  return {
    ...actual,
    usePaymentDetailQuery: vi.fn((id?: string) => {
      if (!id || !currentMockPayment) {
        return { data: null, isLoading: false, isError: false, error: null, refetch: vi.fn() };
      }
      return {
        data: currentMockPayment,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    }),
    useMarkCodCollectedMutation: vi.fn(() => ({
      mutateAsync: mockMarkCodCollectedMutateAsync,
      isPending: false,
    })),
  };
});

const mockPaymentList: PaymentListItem[] = [
  {
    id: 'pay-ssl-001',
    orderId: 'ord-1001',
    provider: 'SSLCOMMERZ',
    status: 'PAID',
    amount: '4500.00',
    currency: 'BDT',
    transactionId: 'SSL-TXN-987654321',
    providerReference: 'VAL-12345',
    bankTranId: 'BANK-9988',
    paidAt: '2026-11-13T14:30:00.000Z',
    failureReason: null,
    createdAt: '2026-11-13T14:20:00.000Z',
    updatedAt: '2026-11-13T14:30:00.000Z',
    order: {
      id: 'ord-1001',
      orderNumber: 'ORD-1001',
      status: 'CONFIRMED',
      customerId: 'cust-1',
      grandTotal: '4500.00',
    },
  },
  {
    id: 'pay-cod-002',
    orderId: 'ord-1002',
    provider: 'COD',
    status: 'PENDING',
    amount: '2200.00',
    currency: 'BDT',
    transactionId: null,
    providerReference: null,
    bankTranId: null,
    paidAt: null,
    failureReason: null,
    createdAt: '2026-11-13T15:00:00.000Z',
    updatedAt: '2026-11-13T15:00:00.000Z',
    order: {
      id: 'ord-1002',
      orderNumber: 'ORD-1002',
      status: 'DELIVERED',
      customerId: 'cust-2',
      grandTotal: '2200.00',
    },
  },
];

const mockDetailPayment: PaymentDetailEntity = {
  id: 'pay-cod-002',
  orderId: 'ord-1002',
  provider: 'COD',
  status: 'PENDING',
  amount: '2200.00',
  currency: 'BDT',
  transactionId: null,
  providerReference: null,
  bankTranId: null,
  paidAt: null,
  failureReason: null,
  createdAt: '2026-11-13T15:00:00.000Z',
  updatedAt: '2026-11-13T15:00:00.000Z',
  order: {
    id: 'ord-1002',
    orderNumber: 'ORD-1002',
    status: 'DELIVERED',
    customerId: 'cust-2',
    grandTotal: '2200.00',
  },
  events: [
    {
      id: 'evt-1',
      paymentId: 'pay-cod-002',
      provider: 'COD',
      eventId: 'EVT-INIT-001',
      eventType: 'ORDER_COD_PLACED',
      signatureValid: true,
      processedAt: '2026-11-13T15:00:00.000Z',
      createdAt: '2026-11-13T15:00:00.000Z',
    },
  ],
};

describe('Phase 7A: Payments Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockPayment = { ...mockDetailPayment };
  });

  const setupPermissions = (perms: string[], isSuper = false) => {
    vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
      user: undefined,
      roles: isSuper ? ['SUPER_ADMIN'] : ['STAFF'],
      isSuperAdmin: isSuper,
      isLoading: false,
      isAuthenticated: true,
      permissions: perms,
      hasPermission: (slug: string) => isSuper || perms.includes(slug),
      hasAnyPermission: (slugs: string[]) => isSuper || slugs.some((s) => perms.includes(s)),
      hasAllPermissions: (slugs: string[]) => isSuper || slugs.every((s) => perms.includes(s)),
    });
  };

  describe('1. Masked Transaction ID Utility', () => {
    it('returns fallback dash for null/undefined/empty transaction ID', () => {
      expect(maskTransactionId(null)).toBe('—');
      expect(maskTransactionId(undefined)).toBe('—');
      expect(maskTransactionId('')).toBe('—');
    });

    it('returns bare ID if length is 8 or less', () => {
      expect(maskTransactionId('12345678')).toBe('12345678');
    });

    it('masks middle characters when length > 8', () => {
      expect(maskTransactionId('SSL-TXN-987654321')).toBe('SSL-••••4321');
    });
  });

  describe('2. Payments Table Rendering', () => {
    it('renders payments list with order number, provider, amount, status badge, and masked txId', () => {
      setupPermissions(['payment:read']);
      const onViewPayment = vi.fn();

      render(
        <AppProviders>
          <PaymentsTable
            data={mockPaymentList}
            total={2}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
            onViewPayment={onViewPayment}
          />
        </AppProviders>
      );

      expect(screen.getByText('#ORD-1001')).toBeInTheDocument();
      expect(screen.getByText('#ORD-1002')).toBeInTheDocument();
      expect(screen.getByText('SSLCOMMERZ')).toBeInTheDocument();
      expect(screen.getByText('Cash on Delivery')).toBeInTheDocument();
      expect(screen.getByText('4,500.00')).toBeInTheDocument();
      expect(screen.getByText('2,200.00')).toBeInTheDocument();
      expect(screen.getByText('Paid')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('SSL-••••4321')).toBeInTheDocument();

      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      expect(viewButtons[0]).toBeDefined();
      fireEvent.click(viewButtons[0]!);
      expect(onViewPayment).toHaveBeenCalledWith(mockPaymentList[0]);
    });
  });

  describe('3. Payment Detail Modal & Operational Actions', () => {
    it('renders payment identifiers, order summary, and gateway event history', () => {
      setupPermissions(['payment:read']);

      render(
        <AppProviders>
          <PaymentDetailModal
            paymentId="pay-cod-002"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Payment Details')).toBeInTheDocument();
      expect(screen.getByText('#ORD-1002')).toBeInTheDocument();
      expect(screen.getByText('Gateway Event History (1)')).toBeInTheDocument();
      expect(screen.getByText('ORDER_COD_PLACED')).toBeInTheDocument();
    });

    it('enables "Mark COD Collected" for delivered COD orders when payment:manage is granted', async () => {
      setupPermissions(['payment:manage']);
      mockMarkCodCollectedMutateAsync.mockResolvedValueOnce({
        ...mockDetailPayment,
        status: 'PAID',
      });

      render(
        <AppProviders>
          <PaymentDetailModal
            paymentId="pay-cod-002"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      const markBtn = screen.getByRole('button', { name: /mark cod collected/i });
      expect(markBtn).not.toBeDisabled();

      fireEvent.click(markBtn);

      // Confirm dialog opens
      expect(screen.getByText('Confirm COD Collection')).toBeInTheDocument();
      const noteInput = screen.getByPlaceholderText(/steadfast courier batch/i);
      fireEvent.change(noteInput, { target: { value: 'Received from courier batch #123' } });

      const confirmBtn = screen.getByRole('button', { name: /confirm cash received/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockMarkCodCollectedMutateAsync).toHaveBeenCalledWith({
          id: 'pay-cod-002',
          input: { note: 'Received from courier batch #123' },
        });
      });
    });

    it('disables "Mark COD Collected" if order is not DELIVERED', () => {
      setupPermissions(['payment:manage']);
      currentMockPayment = {
        ...mockDetailPayment,
        order: {
          id: 'ord-1002',
          orderNumber: 'ORD-1002',
          status: 'SHIPPED', // Not yet delivered!
        },
      };

      render(
        <AppProviders>
          <PaymentDetailModal
            paymentId="pay-cod-002"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      const markBtn = screen.getByRole('button', { name: /mark cod collected/i });
      expect(markBtn).toBeDisabled();
      expect(screen.getByText(/order not yet delivered/i)).toBeInTheDocument();
    });

    it('hides COD collection action button if payment:manage is missing', () => {
      setupPermissions(['payment:read']); // Only read, not manage

      render(
        <AppProviders>
          <PaymentDetailModal
            paymentId="pay-cod-002"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /mark cod collected/i })).not.toBeInTheDocument();
      expect(screen.getByText(/you do not have permission to mark cod payments collected/i)).toBeInTheDocument();
    });

    it('enforces strict allowlist on raw gateway payload, filtering secret keys', () => {
      const untrustedPayload = {
        tran_id: 'TRAN-999',
        val_id: 'VAL-12345',
        amount: '1500.00',
        status: 'VALID',
        store_passwd: 'super_secret_password',
        sessionkey: 'secret-session-token-xyz',
        jwt_token: 'bearer.token.payload',
        card_type: 'VISA',
      };

      const safe = filterPayloadAllowlist(untrustedPayload);
      expect(safe).toEqual({
        tran_id: 'TRAN-999',
        val_id: 'VAL-12345',
        amount: '1500.00',
        status: 'VALID',
        card_type: 'VISA',
      });
      expect(safe).not.toHaveProperty('store_passwd');
      expect(safe).not.toHaveProperty('sessionkey');
      expect(safe).not.toHaveProperty('jwt_token');
    });
  });
});
