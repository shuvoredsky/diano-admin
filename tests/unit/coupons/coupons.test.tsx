import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  CouponsTable,
  CouponsFilterBar,
  CouponFormModal,
  CouponsManager,
  type CouponEntity,
} from '@/features/coupons';
import * as usePermissionsHook from '@/hooks/use-permissions';
import * as dirtyGuardHook from '@/lib/crud/use-dirty-form-guard';
import type * as CouponsQueriesModule from '@/features/coupons/hooks/use-coupons-queries';

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
  usePathname: () => '/admin/coupons',
  useSearchParams: () => mockSearchParams,
}));

const mockCreateCouponMutateAsync = vi.fn();
const mockUpdateCouponMutateAsync = vi.fn();
const mockDeleteCouponMutateAsync = vi.fn();

vi.mock('@/features/coupons/hooks/use-coupons-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof CouponsQueriesModule>();
  return {
    ...actual,
    useCouponsQuery: vi.fn(() => ({
      data: {
        data: [mockCouponPercentage, mockCouponFixed],
        meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
      },
      isLoading: false,
    })),
    useCreateCouponMutation: vi.fn(() => ({
      mutateAsync: mockCreateCouponMutateAsync,
      isPending: false,
    })),
    useUpdateCouponMutation: vi.fn(() => ({
      mutateAsync: mockUpdateCouponMutateAsync,
      isPending: false,
    })),
    useDeleteCouponMutation: vi.fn(() => ({
      mutateAsync: mockDeleteCouponMutateAsync,
      isPending: false,
    })),
  };
});

const mockCouponPercentage: CouponEntity = {
  id: 'coup-101',
  code: 'SUMMER20',
  type: 'PERCENTAGE',
  value: '20.00',
  minPurchase: '1000.00',
  maxDiscount: '500.00',
  startsAt: '2026-11-01T00:00:00.000Z',
  expiresAt: '2026-11-30T23:59:59.000Z',
  usageLimit: 500,
  perUserLimit: 1,
  usedCount: 42,
  firstOrderOnly: false,
  allowOnSale: true,
  isActive: true,
  deletedAt: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

const mockCouponFixed: CouponEntity = {
  id: 'coup-102',
  code: 'FLAT200',
  type: 'FIXED',
  value: '200.00',
  minPurchase: '1500.00',
  maxDiscount: null,
  startsAt: '2026-11-01T00:00:00.000Z',
  expiresAt: '2026-11-30T23:59:59.000Z',
  usageLimit: null,
  perUserLimit: 2,
  usedCount: 15,
  firstOrderOnly: true,
  allowOnSale: false,
  isActive: false,
  deletedAt: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
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

describe('Phase 8A: Coupons Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    setupPermissions(['coupon:read', 'coupon:manage'], true);
  });

  describe('1. Coupons Table & Rendering', () => {
    it('renders coupons table with code, discount values, and usage limits', () => {
      render(
        <AppProviders>
          <CouponsTable
            coupons={[mockCouponPercentage, mockCouponFixed]}
            isLoading={false}
            onEditCoupon={vi.fn()}
            onCreateCoupon={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('SUMMER20')).toBeInTheDocument();
      expect(screen.getByText('20.00% OFF')).toBeInTheDocument();
      expect(screen.getByText('FLAT200')).toBeInTheDocument();
      expect(screen.getByText('200.00')).toBeInTheDocument();
      expect(screen.getByText(/42 \/ 500/)).toBeInTheDocument();
    });

    it('triggers delete confirmation dialog', async () => {
      render(
        <AppProviders>
          <CouponsTable
            coupons={[mockCouponPercentage]}
            isLoading={false}
            onEditCoupon={vi.fn()}
            onCreateCoupon={vi.fn()}
          />
        </AppProviders>
      );

      const deleteBtn = screen.getByTitle('Delete coupon');
      fireEvent.click(deleteBtn);

      expect(screen.getByText(/Delete Coupon "SUMMER20"\?/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: 'Delete Coupon' });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockDeleteCouponMutateAsync).toHaveBeenCalledWith('coup-101');
      });
    });
  });

  describe('2. Coupons Filter Bar', () => {
    it('synchronizes search, type, and status with URL parameters', () => {
      mockSearchParams = new URLSearchParams('search=SUMMER&type=PERCENTAGE&isActive=true');

      render(
        <AppProviders>
          <CouponsFilterBar />
        </AppProviders>
      );

      const searchInput = screen.getByPlaceholderText(/search coupon code/i);
      expect(searchInput).toHaveValue('SUMMER');

      const typeSelect = screen.getByLabelText(/filter by coupon type/i);
      expect(typeSelect).toHaveValue('PERCENTAGE');

      fireEvent.change(searchInput, { target: { value: 'WINTER' } });
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('search=WINTER'), { scroll: false });

      fireEvent.change(typeSelect, { target: { value: 'FIXED' } });
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('type=FIXED'), { scroll: false });
    });
  });

  describe('3. Coupon Form Modal (Create & Edit)', () => {
    it('validates coupon code and date bounds upon submission', async () => {
      render(
        <AppProviders>
          <CouponFormModal isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const submitBtn = screen.getByRole('button', { name: /create coupon/i });
      fireEvent.click(submitBtn);

      expect(mockCreateCouponMutateAsync).not.toHaveBeenCalled();
      expect(screen.getByText(/coupon code is required/i)).toBeInTheDocument();

      // Enter code and valid inputs
      const codeInput = screen.getByLabelText(/coupon code/i);
      fireEvent.change(codeInput, { target: { value: 'WINTER30' } });

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockCreateCouponMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'WINTER30',
            type: 'PERCENTAGE',
          })
        );
      });
    });

    it('prefills existing coupon fields when editing', async () => {
      render(
        <AppProviders>
          <CouponFormModal isOpen={true} onClose={vi.fn()} couponToEdit={mockCouponPercentage} />
        </AppProviders>
      );

      expect(screen.getByDisplayValue('SUMMER20')).toBeInTheDocument();
      expect(screen.getByDisplayValue('20.00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('500.00')).toBeInTheDocument();

      const updateBtn = screen.getByRole('button', { name: /update coupon/i });
      fireEvent.click(updateBtn);

      await waitFor(() => {
        expect(mockUpdateCouponMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'coup-101',
            input: expect.objectContaining({
              code: 'SUMMER20',
            }),
          })
        );
      });
    });

    it('displays backend error message as-is when coupon creation fails', async () => {
      mockCreateCouponMutateAsync.mockRejectedValueOnce(
        new Error('Coupon code SUMMER20 already exists')
      );

      render(
        <AppProviders>
          <CouponFormModal isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const codeInput = screen.getByLabelText(/coupon code/i);
      fireEvent.change(codeInput, { target: { value: 'SUMMER20' } });

      const submitBtn = screen.getByRole('button', { name: /create coupon/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Coupon code SUMMER20 already exists')).toBeInTheDocument();
      });
    });

    it('preserves exact Decimal values and converts Dhaka schedule to ISO strings without float math', async () => {
      render(
        <AppProviders>
          <CouponFormModal isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const codeInput = screen.getByLabelText(/coupon code/i);
      fireEvent.change(codeInput, { target: { value: 'EXACT99' } });

      const valueInput = screen.getByLabelText(/^value/i);
      fireEvent.change(valueInput, { target: { value: '99.99' } });

      const minPurchaseInput = screen.getByLabelText(/min order/i);
      fireEvent.change(minPurchaseInput, { target: { value: '1499.50' } });

      const maxDiscountInput = screen.getByLabelText(/max cap/i);
      fireEvent.change(maxDiscountInput, { target: { value: '250.25' } });

      const startsInput = screen.getByLabelText(/starts at \(dhaka\)/i);
      fireEvent.change(startsInput, { target: { value: '2026-11-20' } });

      const expiresInput = screen.getByLabelText(/expires at \(dhaka\)/i);
      fireEvent.change(expiresInput, { target: { value: '2026-12-20' } });

      const submitBtn = screen.getByRole('button', { name: /create coupon/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockCreateCouponMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'EXACT99',
            value: '99.99',
            minPurchase: '1499.50',
            maxDiscount: '250.25',
            startsAt: expect.stringMatching(/2026-11-20T/),
            expiresAt: expect.stringMatching(/2026-12-20T/),
          })
        );
      });
    });

    it('tracks form dirty state with dirty-form guard', () => {
      const guardSpy = vi.spyOn(dirtyGuardHook, 'useDirtyFormGuard');

      render(
        <AppProviders>
          <CouponFormModal isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const codeInput = screen.getByLabelText(/coupon code/i);
      fireEvent.change(codeInput, { target: { value: 'NEWCODE' } });

      expect(guardSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('4. Permission Gates', () => {
    it('hides Create, Edit, and Delete actions for unauthorized users', () => {
      setupPermissions(['coupon:read'], false);

      render(
        <AppProviders>
          <CouponsManager />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /create coupon/i })).not.toBeInTheDocument();
      expect(screen.queryByTitle('Edit coupon')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Delete coupon')).not.toBeInTheDocument();
    });
  });
});
