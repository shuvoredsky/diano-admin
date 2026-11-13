import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  AbandonedTable,
  AbandonedDetailModal,
  type AbandonedCheckoutSessionItem,
  type AbandonedCheckoutDetailResponse,
} from '@/features/abandoned';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as AbandonedQueriesModule from '@/features/abandoned/hooks/use-abandoned-queries';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin/abandoned-checkouts',
  useSearchParams: () => new URLSearchParams(),
}));

let currentMockDetail: AbandonedCheckoutDetailResponse | null = null;
const mockTriggerRecoveryMutateAsync = vi.fn();

vi.mock('@/features/abandoned/hooks/use-abandoned-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof AbandonedQueriesModule>();
  return {
    ...actual,
    useAbandonedCheckoutDetailQuery: vi.fn((id?: string) => {
      if (!id || !currentMockDetail) {
        return { data: null, isLoading: false, isError: false, error: null, refetch: vi.fn() };
      }
      return {
        data: currentMockDetail,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    }),
    useTriggerRecoveryMutation: vi.fn(() => ({
      mutateAsync: mockTriggerRecoveryMutateAsync,
      isPending: false,
    })),
  };
});

const mockSessionList: AbandonedCheckoutSessionItem[] = [
  {
    id: 'chk-101',
    sessionId: 'sess-abc-12345678',
    status: 'ABANDONED',
    checkoutValue: '3500.00',
    deviceCategory: 'MOBILE',
    lastActivityAt: '2026-11-13T10:00:00.000Z',
    createdAt: '2026-11-13T09:30:00.000Z',
    updatedAt: '2026-11-13T10:00:00.000Z',
    expiresAt: '2026-11-14T09:30:00.000Z',
    customerInfo: {
      name: 'Tanvir Hossain',
      phone: '01812345678',
      email: 'tanvir@example.com',
      consentForRecovery: true,
    },
    items: [
      {
        variantId: 'var-1',
        name: 'Slim Fit Oxford Shirt',
        sku: 'OX-SLIM-BL-M',
        price: '3500.00',
        quantity: 1,
        lineTotal: '3500.00',
      },
    ],
  },
];

const mockDetailData: AbandonedCheckoutDetailResponse = {
  session: {
    id: 'chk-101',
    sessionId: 'sess-abc-12345678',
    status: 'ABANDONED',
    checkoutValue: '3500.00',
    createdAt: '2026-11-13T09:30:00.000Z',
    lastActivityAt: '2026-11-13T10:00:00.000Z',
    abandonedAt: '2026-11-13T10:00:00.000Z',
    recoveredAt: null,
    abandonmentDurationMinutes: 45,
    deviceCategory: 'MOBILE',
    browser: 'Chrome Mobile 120',
    customerInfo: {
      name: 'Tanvir Hossain',
      phone: '01812345678',
      email: 'tanvir@example.com',
      consentForRecovery: true,
    },
    items: [
      {
        variantId: 'var-1',
        name: 'Slim Fit Oxford Shirt',
        sku: 'OX-SLIM-BL-M',
        price: '3500.00',
        quantity: 1,
        lineTotal: '3500.00',
      },
    ],
    events: [
      {
        type: 'CHECKOUT_STARTED',
        occurredAt: '2026-11-13T09:30:00.000Z',
        metadata: {},
      },
      {
        type: 'CUSTOMER_INFO_ENTERED',
        occurredAt: '2026-11-13T09:35:00.000Z',
        metadata: {},
      },
    ],
    recoveryAttempts: [
      {
        id: 'rec-1',
        channel: 'SMS',
        status: 'DELIVERED',
        sentAt: '2026-11-13T10:30:00.000Z',
      },
    ],
  },
};

describe('Phase 6B: Abandoned Checkouts Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockDetail = { ...mockDetailData };
  });

  const setupPermissions = (perms: string[], isSuper = true) => {
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

  describe('1. Abandoned Table Rendering', () => {
    it('renders checkout row with session, customer, items, and total with MoneyText', () => {
      setupPermissions(['abandoned_checkout:read']);
      const onViewSession = vi.fn();

      render(
        <AppProviders>
          <AbandonedTable
            data={mockSessionList}
            total={1}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
            onViewSession={onViewSession}
          />
        </AppProviders>
      );

      expect(screen.getByText(/sess-abc-123/)).toBeInTheDocument();
      expect(screen.getByText('Tanvir Hossain')).toBeInTheDocument();
      expect(screen.getByText('01812345678')).toBeInTheDocument();
      expect(screen.getByText('1 item')).toBeInTheDocument();
      expect(screen.getByText(/3,500\.00/)).toBeInTheDocument();
      expect(screen.getByText(/abandoned/i)).toBeInTheDocument();

      const detailsBtn = screen.getByRole('button', { name: /details/i });
      fireEvent.click(detailsBtn);
      expect(onViewSession).toHaveBeenCalledWith(mockSessionList[0]);
    });

    it('renders empty state when checkouts list is empty', () => {
      setupPermissions(['abandoned_checkout:read']);

      render(
        <AppProviders>
          <AbandonedTable
            data={[]}
            total={0}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
            onViewSession={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText(/no abandoned checkouts found/i)).toBeInTheDocument();
    });
  });

  describe('2. Detail Modal & Recovery Outreach', () => {
    it('renders customer info, line items, and event log in detail modal', () => {
      setupPermissions(['abandoned_checkout:read']);

      render(
        <AppProviders>
          <AbandonedDetailModal sessionId="chk-101" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      expect(screen.getByText('Tanvir Hossain')).toBeInTheDocument();
      expect(screen.getByText('01812345678')).toBeInTheDocument();
      expect(screen.getByText('tanvir@example.com')).toBeInTheDocument();
      expect(screen.getByText('Slim Fit Oxford Shirt')).toBeInTheDocument();
      expect(screen.getByText('OX-SLIM-BL-M')).toBeInTheDocument();
      expect(screen.getByText('CHECKOUT_STARTED')).toBeInTheDocument();
      expect(screen.getByText('CUSTOMER_INFO_ENTERED')).toBeInTheDocument();
    });

    it('triggers recovery outreach when staff clicks send button', async () => {
      setupPermissions(['abandoned_checkout:read', 'abandoned_checkout:manage'], true);
      mockTriggerRecoveryMutateAsync.mockResolvedValueOnce({
        success: true,
        attemptId: 'rec-new-1',
        message: 'Recovery SMS dispatched to 01812345678',
      });

      render(
        <AppProviders>
          <AbandonedDetailModal sessionId="chk-101" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const sendBtn = screen.getByRole('button', { name: /send recovery message/i });
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(mockTriggerRecoveryMutateAsync).toHaveBeenCalledWith({
          id: 'chk-101',
          input: { channel: 'SMS' },
        });
        expect(
          screen.getByText('Recovery SMS dispatched to 01812345678')
        ).toBeInTheDocument();
      });
    });

    it('hides recovery action section when user lacks abandoned_checkout:manage', () => {
      setupPermissions(['abandoned_checkout:read'], false);

      render(
        <AppProviders>
          <AbandonedDetailModal sessionId="chk-101" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      expect(
        screen.queryByRole('button', { name: /send recovery message/i })
      ).not.toBeInTheDocument();
    });
  });
});
