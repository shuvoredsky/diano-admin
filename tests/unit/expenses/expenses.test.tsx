import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  ExpensesTable,
  ExpensesFilterBar,
  ExpenseFormModal,
  ExpensesManager,
  type ExpenseEntity,
} from '@/features/expenses';
import * as usePermissionsHook from '@/hooks/use-permissions';
import * as dirtyGuardHook from '@/lib/crud/use-dirty-form-guard';
import type * as ExpensesQueriesModule from '@/features/expenses/hooks/use-expenses-queries';

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
  usePathname: () => '/admin/expenses',
  useSearchParams: () => mockSearchParams,
}));

const mockCreateExpenseMutateAsync = vi.fn();
const mockUpdateExpenseMutateAsync = vi.fn();
const mockDeleteExpenseMutateAsync = vi.fn();

const mockExpenseRent: ExpenseEntity = {
  id: 'exp-301',
  category: 'RENT',
  amount: '35000.00',
  date: '2026-11-01T00:00:00.000Z',
  note: 'Main showroom rent for November 2026',
  createdBy: 'usr-admin',
  createdAt: '2026-11-01T06:00:00.000Z',
  updatedAt: '2026-11-01T06:00:00.000Z',
};

const mockExpenseUtilities: ExpenseEntity = {
  id: 'exp-302',
  category: 'UTILITIES',
  amount: '12450.75',
  date: '2026-11-05T00:00:00.000Z',
  note: 'DESCO electricity bill for warehouse',
  createdBy: 'usr-admin',
  createdAt: '2026-11-05T08:00:00.000Z',
  updatedAt: '2026-11-05T08:00:00.000Z',
};

vi.mock('@/features/expenses/hooks/use-expenses-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof ExpensesQueriesModule>();
  return {
    ...actual,
    useExpensesQuery: vi.fn(() => ({
      data: {
        data: [mockExpenseRent, mockExpenseUtilities],
        meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
      },
      isLoading: false,
    })),
    useCreateExpenseMutation: vi.fn(() => ({
      mutateAsync: mockCreateExpenseMutateAsync,
      isPending: false,
    })),
    useUpdateExpenseMutation: vi.fn(() => ({
      mutateAsync: mockUpdateExpenseMutateAsync,
      isPending: false,
    })),
    useDeleteExpenseMutation: vi.fn(() => ({
      mutateAsync: mockDeleteExpenseMutateAsync,
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

describe('Phase 8B: Expenses Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    setupPermissions(['expense:manage'], true);
  });

  describe('1. Expenses Table & Rendering', () => {
    it('renders category, BDT MoneyText amounts, and notes accurately', () => {
      render(
        <AppProviders>
          <ExpensesTable
            expenses={[mockExpenseRent, mockExpenseUtilities]}
            isLoading={false}
            onEditExpense={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Rent & Lease')).toBeInTheDocument();
      expect(screen.getByText('35,000.00')).toBeInTheDocument();
      expect(screen.getByText('Main showroom rent for November 2026')).toBeInTheDocument();

      expect(screen.getByText('Utilities & Bills')).toBeInTheDocument();
      expect(screen.getByText('12,450.75')).toBeInTheDocument();
    });

    it('triggers delete confirmation dialog and calls delete mutation', async () => {
      render(
        <AppProviders>
          <ExpensesTable
            expenses={[mockExpenseRent]}
            isLoading={false}
            onEditExpense={vi.fn()}
          />
        </AppProviders>
      );

      const deleteBtn = screen.getByTitle('Delete expense');
      fireEvent.click(deleteBtn);

      expect(screen.getByText(/Are you sure you want to permanently delete this expense voucher\?/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: 'Delete Expense' });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockDeleteExpenseMutateAsync).toHaveBeenCalledWith('exp-301');
      });
    });
  });

  describe('2. Expenses Filter Bar', () => {
    it('synchronizes category and Dhaka date boundaries with URL search parameters', () => {
      mockSearchParams = new URLSearchParams('category=RENT&from=2026-11-01&to=2026-11-30');

      render(
        <AppProviders>
          <ExpensesFilterBar />
        </AppProviders>
      );

      const categorySelect = screen.getByLabelText(/filter by expense category/i);
      expect(categorySelect).toHaveValue('RENT');

      const fromInput = screen.getByLabelText(/filter from date/i);
      expect(fromInput).toHaveValue('2026-11-01');

      const toInput = screen.getByLabelText(/filter to date/i);
      expect(toInput).toHaveValue('2026-11-30');

      fireEvent.change(categorySelect, { target: { value: 'MARKETING' } });
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('category=MARKETING'), { scroll: false });
    });
  });

  describe('3. Expense Form Modal (Create, Edit & Exact Decimal Validation)', () => {
    it('validates amount and required fields upon submission', async () => {
      render(
        <AppProviders>
          <ExpenseFormModal isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const submitBtn = screen.getByRole('button', { name: /save expense/i });
      fireEvent.click(submitBtn);

      expect(mockCreateExpenseMutateAsync).not.toHaveBeenCalled();
      expect(screen.getByText(/expense amount is required/i)).toBeInTheDocument();
    });

    it('preserves exact Decimal string without IEEE-754 float precision loss and sends ISO date', async () => {
      render(
        <AppProviders>
          <ExpenseFormModal isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '18750.45' } });

      const dateInput = screen.getByLabelText(/date \(asia\/dhaka\)/i);
      fireEvent.change(dateInput, { target: { value: '2026-11-12' } });

      const noteInput = screen.getByLabelText(/description/i);
      fireEvent.change(noteInput, { target: { value: 'Google AdWords Campaign BDT settlement' } });

      const submitBtn = screen.getByRole('button', { name: /save expense/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockCreateExpenseMutateAsync).toHaveBeenCalledWith({
          category: 'RENT',
          amount: '18750.45',
          date: expect.stringMatching(/2026-11-12T/),
          note: 'Google AdWords Campaign BDT settlement',
        });
      });
    });

    it('displays backend error message as-is when expense creation fails', async () => {
      mockCreateExpenseMutateAsync.mockRejectedValueOnce(
        new Error('Expense voucher number already recorded for this period')
      );

      render(
        <AppProviders>
          <ExpenseFormModal isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '5000' } });

      const submitBtn = screen.getByRole('button', { name: /save expense/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText('Expense voucher number already recorded for this period')
        ).toBeInTheDocument();
      });
    });

    it('tracks form dirty state with useDirtyFormGuard', () => {
      const guardSpy = vi.spyOn(dirtyGuardHook, 'useDirtyFormGuard');

      render(
        <AppProviders>
          <ExpenseFormModal isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const amountInput = screen.getByLabelText(/amount/i);
      fireEvent.change(amountInput, { target: { value: '1000' } });

      expect(guardSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('4. Permission Gates', () => {
    it('hides Record Expense, edit, and delete buttons for unauthorized users', () => {
      setupPermissions([], false);

      render(
        <AppProviders>
          <ExpensesManager />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /record expense/i })).not.toBeInTheDocument();
      expect(screen.queryByTitle('Edit expense')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Delete expense')).not.toBeInTheDocument();
    });
  });
});

