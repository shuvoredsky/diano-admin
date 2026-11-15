import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  FlashSalesTable,
  CreateFlashSaleModal,
  FlashSalesManager,
  type FlashSaleEntity,
} from '@/features/flash-sales';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as FlashSalesQueriesModule from '@/features/flash-sales/hooks/use-flash-sales-queries';

const mockCreateFlashSaleMutateAsync = vi.fn();

const mockActiveSale: FlashSaleEntity = {
  id: 'fs-101',
  title: 'Midnight Winter Flash Sale',
  description: 'Limited midnight stock clearance for knitwear',
  startsAt: '2026-11-10T18:00:00.000Z',
  endsAt: '2026-11-20T18:00:00.000Z',
  isActive: true,
  createdAt: '2026-11-10T12:00:00.000Z',
  updatedAt: '2026-11-10T12:00:00.000Z',
  items: [
    {
      id: 'fsi-1',
      flashSaleId: 'fs-101',
      variantId: 'var-panjabi-navy-l',
      discountPrice: '1800.00',
      stockLimit: 25,
      soldCount: 8,
    },
  ],
};

vi.mock('@/features/flash-sales/hooks/use-flash-sales-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof FlashSalesQueriesModule>();
  return {
    ...actual,
    useActiveFlashSalesQuery: vi.fn(() => ({
      data: [mockActiveSale],
      isLoading: false,
    })),
    useCreateFlashSaleMutation: vi.fn(() => ({
      mutateAsync: mockCreateFlashSaleMutateAsync,
      isPending: false,
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

describe('Phase 8A: Flash Sales Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupPermissions(['coupon:read', 'coupon:manage'], true);
  });

  describe('1. Flash Sales Table', () => {
    it('renders campaign details, items count, and BG-06 read-only badge', () => {
      render(
        <AppProviders>
          <FlashSalesTable
            sales={[mockActiveSale]}
            isLoading={false}
            onCreateSale={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Midnight Winter Flash Sale')).toBeInTheDocument();
      expect(screen.getByText(/Limited midnight stock clearance/)).toBeInTheDocument();
      expect(screen.getByText('1 Variant')).toBeInTheDocument();
      expect(screen.getByText(/Read-only \(BG-06\)/)).toBeInTheDocument();
      expect(screen.getByText('var-panjabi-navy-l')).toBeInTheDocument();
      expect(screen.getByText('1,800.00')).toBeInTheDocument();
    });
  });

  describe('2. Create Flash Sale Modal', () => {
    it('validates title and required date range before submitting campaign', async () => {
      render(
        <AppProviders>
          <CreateFlashSaleModal isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const submitBtn = screen.getByRole('button', { name: /launch campaign/i });
      fireEvent.click(submitBtn);

      expect(mockCreateFlashSaleMutateAsync).not.toHaveBeenCalled();
      expect(screen.getByText(/campaign title must be at least 3 characters/i)).toBeInTheDocument();

      // Enter title and dates
      const titleInput = screen.getByLabelText(/campaign title/i);
      fireEvent.change(titleInput, { target: { value: 'Cyber Monday Deals' } });

      const startsInput = screen.getByLabelText(/starts at \(dhaka\)/i);
      fireEvent.change(startsInput, { target: { value: '2026-11-25' } });

      const endsInput = screen.getByLabelText(/ends at \(dhaka\)/i);
      fireEvent.change(endsInput, { target: { value: '2026-11-27' } });

      // Fill in first variant row
      const variantInput = screen.getByPlaceholderText(/variant id/i);
      fireEvent.change(variantInput, { target: { value: 'var-oxford-xl' } });

      const priceInput = screen.getByPlaceholderText(/price \(৳\)/i);
      fireEvent.change(priceInput, { target: { value: '1200.00' } });

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockCreateFlashSaleMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Cyber Monday Deals',
            items: [
              {
                variantId: 'var-oxford-xl',
                discountPrice: '1200.00',
                stockLimit: 10,
              },
            ],
          })
        );
      });
    });

    it('allows dynamically adding and removing variant item rows', () => {
      render(
        <AppProviders>
          <CreateFlashSaleModal isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const addBtn = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addBtn);

      expect(screen.getByText(/allocated product variants \(2\)/i)).toBeInTheDocument();
    });
  });

  describe('3. Permission Gates', () => {
    it('hides launch flash sale button for users without coupon:manage permission', () => {
      setupPermissions(['coupon:read'], false);

      render(
        <AppProviders>
          <FlashSalesManager />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /launch flash sale/i })).not.toBeInTheDocument();
    });
  });
});
