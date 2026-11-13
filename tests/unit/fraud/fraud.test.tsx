import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  FraudStatsCards,
  FraudReviewsTable,
  FraudReviewDetailModal,
  FraudRulesTable,
  type FraudStats,
  type FraudReviewListItem,
  type FraudReviewDetailEntity,
  type StoredFraudRule,
} from '@/features/fraud-detection';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as FraudQueriesModule from '@/features/fraud-detection/hooks/use-fraud-queries';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin/fraud-detection',
  useSearchParams: () => new URLSearchParams(),
}));

let currentMockReview: FraudReviewDetailEntity | null = null;
let currentMockRules: StoredFraudRule[] = [];
const mockApproveMutateAsync = vi.fn();
const mockRejectMutateAsync = vi.fn();
const mockRequestOtpMutateAsync = vi.fn();
const mockVerifyOtpMutateAsync = vi.fn();
const mockUpdateRuleMutateAsync = vi.fn();

vi.mock('@/features/fraud-detection/hooks/use-fraud-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof FraudQueriesModule>();
  return {
    ...actual,
    useFraudReviewDetailQuery: vi.fn((id?: string) => {
      if (!id || !currentMockReview) {
        return { data: null, isLoading: false, isError: false, error: null, refetch: vi.fn() };
      }
      return {
        data: currentMockReview,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    }),
    useFraudRulesQuery: vi.fn(() => ({
      data: currentMockRules,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })),
    useApproveFraudReviewMutation: vi.fn(() => ({
      mutateAsync: mockApproveMutateAsync,
      isPending: false,
    })),
    useRejectFraudReviewMutation: vi.fn(() => ({
      mutateAsync: mockRejectMutateAsync,
      isPending: false,
    })),
    useRequestFraudOtpMutation: vi.fn(() => ({
      mutateAsync: mockRequestOtpMutateAsync,
      isPending: false,
    })),
    useVerifyFraudOtpMutation: vi.fn(() => ({
      mutateAsync: mockVerifyOtpMutateAsync,
      isPending: false,
    })),
    useUpdateFraudRuleMutation: vi.fn(() => ({
      mutateAsync: mockUpdateRuleMutateAsync,
      isPending: false,
    })),
  };
});

const mockStats: FraudStats = {
  totalAssessments: 140,
  lowRiskCount: 110,
  mediumRiskCount: 20,
  highRiskCount: 10,
  pendingReviewCount: 8,
  approvedCount: 125,
  rejectedCount: 7,
  falsePositiveCount: 3,
  falsePositiveRate: 0.024,
};

const mockReviewList: FraudReviewListItem[] = [
  {
    id: 'rev-001',
    orderId: 'ord-8001',
    riskScore: 85,
    riskLevel: 'HIGH',
    reviewStatus: 'MANUAL_REVIEW',
    triggeredRules: [
      { key: 'HIGH_VALUE_COD', name: 'High Value COD Order', points: 40, reason: 'COD order exceeds ৳10,000 threshold' },
      { key: 'RAPID_ORDERS', name: 'Rapid Successive Orders', points: 45, reason: '3 orders placed within 10 minutes from same IP' },
    ],
    explanation: 'Order triggered high risk velocity and value thresholds.',
    createdAt: '2026-11-13T10:00:00.000Z',
    updatedAt: '2026-11-13T10:00:00.000Z',
    order: {
      id: 'ord-8001',
      orderNumber: 'ORD-8001',
      grandTotal: '15400.00',
      paymentMethod: 'COD',
      status: 'PENDING',
      placedAt: '2026-11-13T10:00:00.000Z',
    },
  },
  {
    id: 'rev-002',
    orderId: 'ord-8002',
    riskScore: 25,
    riskLevel: 'LOW',
    reviewStatus: 'AUTO_APPROVED',
    triggeredRules: [],
    explanation: 'Normal purchasing pattern.',
    createdAt: '2026-11-13T11:00:00.000Z',
    updatedAt: '2026-11-13T11:00:00.000Z',
    order: {
      id: 'ord-8002',
      orderNumber: 'ORD-8002',
      grandTotal: '1200.00',
      paymentMethod: 'SSLCOMMERZ',
      status: 'CONFIRMED',
      placedAt: '2026-11-13T11:00:00.000Z',
    },
  },
];

const mockReviewDetail: FraudReviewDetailEntity = {
  id: 'rev-001',
  orderId: 'ord-8001',
  riskScore: 85,
  riskLevel: 'HIGH',
  reviewStatus: 'MANUAL_REVIEW',
  triggeredRules: [
    { key: 'HIGH_VALUE_COD', name: 'High Value COD Order', points: 40, reason: 'COD order exceeds ৳10,000 threshold' },
    { key: 'RAPID_ORDERS', name: 'Rapid Successive Orders', points: 45, reason: '3 orders placed within 10 minutes from same IP' },
  ],
  explanation: 'Order triggered high risk velocity and value thresholds.',
  createdAt: '2026-11-13T10:00:00.000Z',
  updatedAt: '2026-11-13T10:00:00.000Z',
  order: {
    id: 'ord-8001',
    orderNumber: 'ORD-8001',
    grandTotal: '15400.00',
    paymentMethod: 'COD',
    status: 'PENDING',
    placedAt: '2026-11-13T10:00:00.000Z',
    customerSnapshot: { phone: '01711223344', email: 'risk@example.com' },
    shippingAddressSnapshot: { address: 'House 5, Road 2', district: 'Dhaka', area: 'Banani' },
  },
  decisionHistory: [
    {
      id: 'dec-1',
      assessmentId: 'rev-001',
      actorId: 'system',
      previousStatus: 'PENDING',
      newStatus: 'MANUAL_REVIEW',
      decision: 'HOLD_FOR_REVIEW',
      reason: 'Automated engine held order for manual risk investigation',
      createdAt: '2026-11-13T10:00:05.000Z',
    },
  ],
};

const mockRulesList: StoredFraudRule[] = [
  {
    id: 'rule-1',
    key: 'HIGH_VALUE_COD',
    name: 'High Value COD Order',
    description: 'Flag orders above ৳10,000 using Cash on Delivery',
    weight: 40,
    isEnabled: true,
    parameters: { maxCodAmount: 10000 },
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  },
  {
    id: 'rule-2',
    key: 'RAPID_ORDERS',
    name: 'Rapid Successive Orders',
    description: 'Flag multiple orders from the same IP/phone in short window',
    weight: 45,
    isEnabled: false,
    parameters: { windowMinutes: 10, maxOrders: 3 },
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  },
];

describe('Phase 7A: Fraud Detection & Review Queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockReview = { ...mockReviewDetail };
    currentMockRules = [...mockRulesList];
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

  describe('1. Fraud Stats Cards', () => {
    it('renders high risk count, pending review count, and false positive rate', () => {
      render(
        <AppProviders>
          <FraudStatsCards stats={mockStats} isLoading={false} />
        </AppProviders>
      );

      expect(screen.getByText('High Risk Flagged')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText(/FP Rate: 2.4%/)).toBeInTheDocument();
    });
  });

  describe('2. Fraud Reviews Table', () => {
    it('renders review queue with order number, risk level, score, status, and triggered rules', () => {
      setupPermissions(['fraud:read']);
      const onViewReview = vi.fn();

      render(
        <AppProviders>
          <FraudReviewsTable
            data={mockReviewList}
            total={2}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
            onViewReview={onViewReview}
          />
        </AppProviders>
      );

      expect(screen.getByText('#ORD-8001')).toBeInTheDocument();
      expect(screen.getByText('#ORD-8002')).toBeInTheDocument();
      expect(screen.getByText('High Risk')).toBeInTheDocument();
      expect(screen.getByText('Low Risk')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getAllByText('25').length).toBeGreaterThan(0);
      expect(screen.getByText('Needs Manual Review')).toBeInTheDocument();
      expect(screen.getByText('Auto Approved')).toBeInTheDocument();
      expect(screen.getByText('High Value COD Order')).toBeInTheDocument();

      const reviewButtons = screen.getAllByRole('button', { name: /review/i });
      expect(reviewButtons[0]).toBeDefined();
      fireEvent.click(reviewButtons[0]!);
      expect(onViewReview).toHaveBeenCalledWith(mockReviewList[0]);
    });
  });

  describe('3. Fraud Review Detail Modal & Review Actions', () => {
    it('renders review facts, triggered risk signals, and decision audit trail', () => {
      setupPermissions(['fraud:read']);

      render(
        <AppProviders>
          <FraudReviewDetailModal
            reviewId="rev-001"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Fraud Risk Review')).toBeInTheDocument();
      expect(screen.getByText('85 / 100')).toBeInTheDocument();
      expect(screen.getByText('#ORD-8001')).toBeInTheDocument();
      expect(screen.getByText('Triggered Risk Signals (2)')).toBeInTheDocument();
      expect(screen.getByText('+40 pts')).toBeInTheDocument();
      expect(screen.getByText('+45 pts')).toBeInTheDocument();
      expect(screen.getByText('Decision Audit Trail (1)')).toBeInTheDocument();
    });

    it('approves a held order with optional false-positive flag and staff note', async () => {
      setupPermissions(['fraud:review']);
      mockApproveMutateAsync.mockResolvedValueOnce({
        ...mockReviewDetail,
        reviewStatus: 'APPROVED',
      });

      render(
        <AppProviders>
          <FraudReviewDetailModal
            reviewId="rev-001"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      const approveBtn = screen.getByRole('button', { name: /approve order/i });
      fireEvent.click(approveBtn);

      expect(screen.getByText('Approve Held Order')).toBeInTheDocument();

      // Toggle false positive checkbox
      const fpCheckbox = screen.getByLabelText(/mark as false positive/i);
      fireEvent.click(fpCheckbox);

      // Enter staff note
      const noteInput = screen.getByPlaceholderText(/spoke to customer via phone/i);
      fireEvent.change(noteInput, { target: { value: 'Verified identity directly.' } });

      const confirmBtn = screen.getByRole('button', { name: /confirm approval/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockApproveMutateAsync).toHaveBeenCalledWith({
          id: 'rev-001',
          input: {
            isFalsePositive: true,
            note: 'Verified identity directly.',
          },
        });
      });
    });

    it('rejects an order only when detailed reason (min 3 chars) is provided', async () => {
      setupPermissions(['fraud:review']);
      mockRejectMutateAsync.mockResolvedValueOnce({
        ...mockReviewDetail,
        reviewStatus: 'REJECTED',
      });

      render(
        <AppProviders>
          <FraudReviewDetailModal
            reviewId="rev-001"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      const rejectBtn = screen.getByRole('button', { name: /reject & cancel order/i });
      fireEvent.click(rejectBtn);

      expect(screen.getByText('Reject Review & Cancel Order')).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: 'Reject & Cancel Order' });
      // Attempt click with empty reason
      fireEvent.click(confirmBtn);
      expect(screen.getByText(/detailed rejection reason is required/i)).toBeInTheDocument();
      expect(mockRejectMutateAsync).not.toHaveBeenCalled();

      // Enter valid reason
      const reasonInput = screen.getByPlaceholderText(/unreachable phone number/i);
      fireEvent.change(reasonInput, { target: { value: 'Customer phone unreachable and fake address.' } });

      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockRejectMutateAsync).toHaveBeenCalledWith({
          id: 'rev-001',
          input: { reason: 'Customer phone unreachable and fake address.' },
        });
      });
    });

    it('hides decision buttons when lacking fraud:review permission', () => {
      setupPermissions(['fraud:read']); // Only read

      render(
        <AppProviders>
          <FraudReviewDetailModal
            reviewId="rev-001"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /approve order/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reject & cancel order/i })).not.toBeInTheDocument();
      expect(screen.getByText(/you do not have permission to approve, reject, or request otp/i)).toBeInTheDocument();
    });
  });

  describe('4. Fraud Rules Management', () => {
    it('renders rules and triggers toggle mutation when active switch is clicked', async () => {
      setupPermissions(['fraud:manage']);
      mockUpdateRuleMutateAsync.mockResolvedValueOnce({
        ...mockRulesList[0],
        isEnabled: false,
      });

      render(
        <AppProviders>
          <FraudRulesTable />
        </AppProviders>
      );

      expect(screen.getByText('High Value COD Order')).toBeInTheDocument();
      expect(screen.getByText('Rapid Successive Orders')).toBeInTheDocument();
      expect(screen.getByText('40 pts')).toBeInTheDocument();
      expect(screen.getByText('45 pts')).toBeInTheDocument();

      const switches = screen.getAllByRole('switch');
      expect(switches[0]).toHaveAttribute('aria-checked', 'true');
      expect(switches[1]).toHaveAttribute('aria-checked', 'false');

      expect(switches[0]).toBeDefined();
      fireEvent.click(switches[0]!);

      await waitFor(() => {
        expect(mockUpdateRuleMutateAsync).toHaveBeenCalledWith({
          key: 'HIGH_VALUE_COD',
          input: { isEnabled: false },
        });
      });
    });

    it('validates weight and rule name inside edit rule modal', async () => {
      setupPermissions(['fraud:manage']);
      mockUpdateRuleMutateAsync.mockResolvedValueOnce({
        ...mockRulesList[0],
        weight: 50,
      });

      render(
        <AppProviders>
          <FraudRulesTable />
        </AppProviders>
      );

      const editBtns = screen.getAllByRole('button', { name: /edit/i });
      expect(editBtns[0]).toBeDefined();
      fireEvent.click(editBtns[0]!);

      expect(screen.getByText('Edit Fraud Rule')).toBeInTheDocument();

      const weightInput = screen.getByLabelText(/risk weight points/i);
      fireEvent.change(weightInput, { target: { value: '50' } });

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(mockUpdateRuleMutateAsync).toHaveBeenCalledWith({
          key: 'HIGH_VALUE_COD',
          input: {
            name: 'High Value COD Order',
            description: 'Flag orders above ৳10,000 using Cash on Delivery',
            weight: 50,
          },
        });
      });
    });
  });
});
