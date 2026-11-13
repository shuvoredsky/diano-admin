import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  CustomersTable,
  CustomerDetailModal,
  type CustomerListItem,
  type CustomerDetailAdminView,
  type CustomerNoteItem,
} from '@/features/customers';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as CustomersQueriesModule from '@/features/customers/hooks/use-customers-queries';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin/customers',
  useSearchParams: () => new URLSearchParams(),
}));

let currentMockCustomer: CustomerDetailAdminView | null = null;
let currentMockNotes: CustomerNoteItem[] = [];
const mockUpdateStatusMutateAsync = vi.fn();
const mockAddNoteMutateAsync = vi.fn();

vi.mock('@/features/customers/hooks/use-customers-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof CustomersQueriesModule>();
  return {
    ...actual,
    useCustomerDetailQuery: vi.fn((id?: string) => {
      if (!id || !currentMockCustomer) {
        return { data: null, isLoading: false, isError: false, error: null, refetch: vi.fn() };
      }
      return {
        data: currentMockCustomer,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    }),
    useCustomerNotesQuery: vi.fn((id?: string) => {
      if (!id) return { data: [], isLoading: false, error: null, refetch: vi.fn() };
      return {
        data: currentMockNotes,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      };
    }),
    useUpdateCustomerStatusMutation: vi.fn(() => ({
      mutateAsync: mockUpdateStatusMutateAsync,
      isPending: false,
    })),
    useAddCustomerNoteMutation: vi.fn(() => ({
      mutateAsync: mockAddNoteMutateAsync,
      isPending: false,
    })),
  };
});

const mockCustomerList: CustomerListItem[] = [
  {
    id: 'cust-101',
    name: 'Mahmudul Hasan',
    email: 'mahmudul@example.com',
    phone: '01712345678',
    status: 'ACTIVE',
    loyaltyPoints: 350,
    totalSpent: '18500.00',
    ordersCount: 4,
    avatarUrl: null,
    createdAt: '2026-08-10T12:00:00.000Z',
    updatedAt: '2026-11-13T10:00:00.000Z',
  },
];

const mockCustomerDetail: CustomerDetailAdminView = {
  id: 'cust-101',
  name: 'Mahmudul Hasan',
  email: 'mahmudul@example.com',
  phone: '01712345678',
  status: 'ACTIVE',
  loyaltyPoints: 350,
  dateOfBirth: '1992-05-15T00:00:00.000Z',
  gender: 'MALE',
  avatarUrl: null,
  createdAt: '2026-08-10T12:00:00.000Z',
  updatedAt: '2026-11-13T10:00:00.000Z',
  addresses: [
    {
      id: 'addr-1',
      userId: 'cust-101',
      type: 'SHIPPING',
      isDefault: true,
      fullName: 'Mahmudul Hasan',
      phone: '01712345678',
      addressLine: 'Flat 4A, Road 8, Uttara Sector 3',
      district: 'Dhaka',
      city: 'Dhaka',
      area: 'Uttara',
      postalCode: '1230',
      createdAt: '2026-08-10T12:00:00.000Z',
      updatedAt: '2026-08-10T12:00:00.000Z',
    },
  ],
  consents: [
    {
      channel: 'SMS',
      purpose: 'MARKETING',
      isGranted: true,
    },
    {
      channel: 'EMAIL',
      purpose: 'RECOVERY',
      isGranted: true,
    },
  ],
  orderSummary: {
    totalOrders: 4,
    totalSpent: '18500.00',
    cancelledOrders: 0,
    returnedOrders: 1,
  },
};

const mockNotesList: CustomerNoteItem[] = [
  {
    id: 'note-1',
    authorId: 'staff-admin-9',
    note: 'Customer requested SMS notifications instead of calls.',
    createdAt: '2026-10-01T10:00:00.000Z',
  },
];

describe('Phase 6B: Customer Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockCustomer = { ...mockCustomerDetail };
    currentMockNotes = [...mockNotesList];
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

  describe('1. Customers Table Rendering', () => {
    it('renders customer row with name, contact, orders count, total spent, points, and status', () => {
      setupPermissions(['customer:read']);
      const onViewCustomer = vi.fn();

      render(
        <AppProviders>
          <CustomersTable
            data={mockCustomerList}
            total={1}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
            onViewCustomer={onViewCustomer}
          />
        </AppProviders>
      );

      expect(screen.getAllByText('Mahmudul Hasan').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('mahmudul@example.com')).toBeInTheDocument();
      expect(screen.getByText('01712345678')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText(/18,500\.00/)).toBeInTheDocument();
      expect(screen.getByText(/350 pts/)).toBeInTheDocument();
      expect(screen.getByText(/active customer/i)).toBeInTheDocument();

      const profileBtn = screen.getByRole('button', { name: /profile/i });
      fireEvent.click(profileBtn);
      expect(onViewCustomer).toHaveBeenCalledWith(mockCustomerList[0]);
    });

    it('renders empty state when customer list is empty', () => {
      setupPermissions(['customer:read']);

      render(
        <AppProviders>
          <CustomersTable
            data={[]}
            total={0}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
            onViewCustomer={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText(/no customers found/i)).toBeInTheDocument();
    });
  });

  describe('2. Customer Detail Modal & Staff Notes', () => {
    it('renders profile details, addresses, and order summary', () => {
      setupPermissions(['customer:read']);

      render(
        <AppProviders>
          <CustomerDetailModal customerId="cust-101" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      expect(screen.getAllByText('Mahmudul Hasan').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('mahmudul@example.com')).toBeInTheDocument();
      expect(screen.getByText('Flat 4A, Road 8, Uttara Sector 3')).toBeInTheDocument();
      expect(screen.getByText('Uttara, Dhaka, Dhaka')).toBeInTheDocument();
      expect(screen.getByText('Customer requested SMS notifications instead of calls.')).toBeInTheDocument();
      expect(screen.getByText(/18,500\.00/)).toBeInTheDocument();
    });

    it('submits staff internal note', async () => {
      setupPermissions(['customer:read', 'customer:manage'], true);
      mockAddNoteMutateAsync.mockResolvedValueOnce({
        id: 'note-2',
        authorId: 'staff-admin-9',
        note: 'Customer verified phone number via OTP.',
        createdAt: '2026-11-13T10:05:00.000Z',
      });

      render(
        <AppProviders>
          <CustomerDetailModal customerId="cust-101" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const noteTextarea = screen.getByPlaceholderText(/add administrative note/i);
      fireEvent.change(noteTextarea, {
        target: { value: 'Customer verified phone number via OTP.' },
      });

      const addNoteBtn = screen.getByRole('button', { name: /add note/i });
      fireEvent.click(addNoteBtn);

      await waitFor(() => {
        expect(mockAddNoteMutateAsync).toHaveBeenCalledWith({
          id: 'cust-101',
          input: { note: 'Customer verified phone number via OTP.' },
        });
      });
    });
  });

  describe('3. Customer Status Management (Suspend / Activate)', () => {
    it('opens confirm dialog and suspends customer account', async () => {
      setupPermissions(['customer:read', 'customer:manage'], true);
      mockUpdateStatusMutateAsync.mockResolvedValueOnce({
        ...mockCustomerDetail,
        status: 'SUSPENDED',
      });

      render(
        <AppProviders>
          <CustomerDetailModal customerId="cust-101" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const suspendBtn = screen.getByRole('button', { name: /suspend customer/i });
      fireEvent.click(suspendBtn);

      // ConfirmDialog
      expect(screen.getByText('Suspend Customer Account')).toBeInTheDocument();
      const confirmBtn = screen.getByRole('button', { name: /suspend account/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockUpdateStatusMutateAsync).toHaveBeenCalledWith({
          id: 'cust-101',
          input: { status: 'SUSPENDED' },
        });
      });
    });

    it('hides status actions and note creation when user lacks customer:manage', () => {
      setupPermissions(['customer:read'], false);

      render(
        <AppProviders>
          <CustomerDetailModal customerId="cust-101" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /suspend customer/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add note/i })).not.toBeInTheDocument();
    });
  });
});
