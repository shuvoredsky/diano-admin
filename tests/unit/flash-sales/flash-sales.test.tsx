import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  FlashSalesTable,
  CreateFlashSaleModal,
  EditFlashSaleModal,
  FlashSalesManager,
  type FlashSaleEntity,
} from '@/features/flash-sales';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as FlashSalesQueriesModule from '@/features/flash-sales/hooks/use-flash-sales-queries';

const mockCreateFlashSaleMutateAsync = vi.fn();
const mockUpdateFlashSaleMutateAsync = vi.fn();
const mockCancelFlashSaleMutateAsync = vi.fn();
const mockDeleteFlashSaleMutateAsync = vi.fn();

const mockActiveSale: FlashSaleEntity = {
  id: 'fs-101',
  title: 'Midnight Winter Flash Sale',
  description: 'Limited midnight stock clearance for knitwear',
  startsAt: '2026-11-10T18:00:00.000Z', // Started in past
  endsAt: '2026-11-30T18:00:00.000Z',
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

const mockFutureSale: FlashSaleEntity = {
  id: 'fs-102',
  title: 'Future New Year Flash Sale',
  description: 'Upcoming deals',
  startsAt: '2026-12-25T18:00:00.000Z', // In future
  endsAt: '2026-12-31T18:00:00.000Z',
  isActive: true,
  createdAt: '2026-11-10T12:00:00.000Z',
  updatedAt: '2026-11-10T12:00:00.000Z',
  items: [],
};

vi.mock('@/features/flash-sales/hooks/use-flash-sales-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof FlashSalesQueriesModule>();
  return {
    ...actual,
    useActiveFlashSalesQuery: vi.fn(() => ({
      data: [mockActiveSale, mockFutureSale],
      isLoading: false,
    })),
    useCreateFlashSaleMutation: vi.fn(() => ({
      mutateAsync: mockCreateFlashSaleMutateAsync,
      isPending: false,
    })),
    useUpdateFlashSaleMutation: vi.fn(() => ({
      mutateAsync: mockUpdateFlashSaleMutateAsync,
      isPending: false,
    })),
    useCancelFlashSaleMutation: vi.fn(() => ({
      mutateAsync: mockCancelFlashSaleMutateAsync,
      isPending: false,
    })),
    useDeleteFlashSaleMutation: vi.fn(() => ({
      mutateAsync: mockDeleteFlashSaleMutateAsync,
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

describe('Flash Sales Management (BG-06 Full Lifecycle)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupPermissions(['coupon:read', 'coupon:manage'], true);
  });

  describe('1. Flash Sales Table Rules', () => {
    it('renders campaign details, items count, and action buttons', () => {
      const onEditMock = vi.fn();
      render(
        <AppProviders>
          <FlashSalesTable
            sales={[mockActiveSale, mockFutureSale]}
            isLoading={false}
            onCreateSale={vi.fn()}
            onEditSale={onEditMock}
          />
        </AppProviders>
      );

      expect(screen.getByText('Midnight Winter Flash Sale')).toBeInTheDocument();
      expect(screen.getByText('Future New Year Flash Sale')).toBeInTheDocument();
      expect(screen.getByText('1 Variant')).toBeInTheDocument();

      // Active started campaign: Cancel is shown, Delete is hidden
      expect(screen.getByRole('button', { name: /cancel midnight winter flash sale/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete midnight winter flash sale/i })).not.toBeInTheDocument();

      // Future unstarted campaign: Delete is shown, Cancel is hidden
      expect(screen.getByRole('button', { name: /delete future new year flash sale/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel future new year flash sale/i })).not.toBeInTheDocument();

      // Clicking Edit invokes callback
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]!);
      expect(onEditMock).toHaveBeenCalledWith(mockActiveSale);
    });

    it('opens ConfirmDialog and cancels an active campaign', async () => {
      render(
        <AppProviders>
          <FlashSalesTable
            sales={[mockActiveSale]}
            isLoading={false}
            onCreateSale={vi.fn()}
            onEditSale={vi.fn()}
          />
        </AppProviders>
      );

      const cancelBtn = screen.getByRole('button', { name: /cancel midnight winter flash sale/i });
      fireEvent.click(cancelBtn);

      expect(screen.getByText(/Are you sure you want to cancel/i)).toBeInTheDocument();
      const confirmBtn = screen.getByRole('button', { name: /cancel campaign/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockCancelFlashSaleMutateAsync).toHaveBeenCalledWith('fs-101');
      });
    });

    it('opens ConfirmDialog and deletes an upcoming future campaign', async () => {
      render(
        <AppProviders>
          <FlashSalesTable
            sales={[mockFutureSale]}
            isLoading={false}
            onCreateSale={vi.fn()}
            onEditSale={vi.fn()}
          />
        </AppProviders>
      );

      const deleteBtn = screen.getByRole('button', { name: /delete future new year flash sale/i });
      fireEvent.click(deleteBtn);

      expect(screen.getByText(/Are you sure you want to permanently delete/i)).toBeInTheDocument();
      const confirmBtn = screen.getByRole('button', { name: /delete campaign/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockDeleteFlashSaleMutateAsync).toHaveBeenCalledWith('fs-102');
      });
    });
  });

  describe('2. Create Flash Sale Modal', () => {
    it('validates required fields and submits campaign creation', async () => {
      const onCloseMock = vi.fn();
      render(
        <AppProviders>
          <CreateFlashSaleModal isOpen={true} onClose={onCloseMock} />
        </AppProviders>
      );

      const submitBtn = screen.getByRole('button', { name: /launch campaign/i });
      fireEvent.click(submitBtn);

      expect(mockCreateFlashSaleMutateAsync).not.toHaveBeenCalled();
      expect(screen.getByText(/campaign title must be at least 3 characters/i)).toBeInTheDocument();

      const titleInput = screen.getByLabelText(/campaign title/i);
      fireEvent.change(titleInput, { target: { value: 'Winter Flash Promo' } });

      const startsInput = screen.getByLabelText(/starts at \(dhaka\)/i);
      fireEvent.change(startsInput, { target: { value: '2026-12-01' } });

      const endsInput = screen.getByLabelText(/ends at \(dhaka\)/i);
      fireEvent.change(endsInput, { target: { value: '2026-12-05' } });

      const variantInput = screen.getByPlaceholderText(/variant id/i);
      fireEvent.change(variantInput, { target: { value: 'var-panjabi-001' } });

      const priceInput = screen.getByPlaceholderText(/price \(৳\)/i);
      fireEvent.change(priceInput, { target: { value: '1500.00' } });

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockCreateFlashSaleMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Winter Flash Promo',
          })
        );
        expect(onCloseMock).toHaveBeenCalled();
      });
    });
  });

  describe('3. Edit Flash Sale Modal', () => {
    it('pre-populates existing data and submits changes to update mutation', async () => {
      const onCloseMock = vi.fn();
      render(
        <AppProviders>
          <EditFlashSaleModal sale={mockActiveSale} isOpen={true} onClose={onCloseMock} />
        </AppProviders>
      );

      expect(screen.getByDisplayValue('Midnight Winter Flash Sale')).toBeInTheDocument();
      expect(screen.getByDisplayValue('var-panjabi-navy-l')).toBeInTheDocument();

      const titleInput = screen.getByLabelText(/campaign title/i);
      fireEvent.change(titleInput, { target: { value: 'Updated Midnight Deals' } });

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(mockUpdateFlashSaleMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'fs-101',
            input: expect.objectContaining({
              title: 'Updated Midnight Deals',
            }),
          })
        );
        expect(onCloseMock).toHaveBeenCalled();
      });
    });

    it('displays backend conflict error message as-is when update fails', async () => {
      mockUpdateFlashSaleMutateAsync.mockRejectedValueOnce(
        new Error("Variant 'var-123' is already included in an overlapping active flash sale 'Weekend Sale'")
      );

      render(
        <AppProviders>
          <EditFlashSaleModal sale={mockActiveSale} isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(
          screen.getByText("Variant 'var-123' is already included in an overlapping active flash sale 'Weekend Sale'")
        ).toBeInTheDocument();
      });
    });
  });

  describe('4. Permission Gates', () => {
    it('hides edit, cancel, delete and launch buttons for users without coupon:manage permission', () => {
      setupPermissions(['coupon:read'], false);

      render(
        <AppProviders>
          <FlashSalesManager />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /launch flash sale/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
  });
});
