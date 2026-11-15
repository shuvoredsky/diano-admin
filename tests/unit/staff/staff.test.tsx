import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AppProviders } from '@/components/providers/app-providers';
import { StaffManager } from '@/features/staff/components/staff-manager';
import * as staffApi from '@/features/staff/api/staff.api';
import * as rolesApi from '@/features/roles-permissions/api/roles.api';
import * as authPermissionsHook from '@/features/auth/hooks/use-auth-permissions';
import type { StaffUser } from '@/features/staff/types/staff.types';
import type { RoleSummaryItem } from '@/features/roles-permissions/types/roles.types';

const mockStaffUsers: StaffUser[] = [
  {
    id: 'user-01',
    name: 'Super Administrator',
    email: 'superadmin@diano.com.bd',
    phone: '+8801711000001',
    avatarUrl: null,
    status: 'ACTIVE',
    roles: [{ id: 'role-01', name: 'Super Administrator', slug: 'super-admin' }],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-02',
    name: 'Tanvir Hossain',
    email: 'tanvir@diano.com.bd',
    phone: '01812345678',
    avatarUrl: null,
    status: 'ACTIVE',
    roles: [{ id: 'role-02', name: 'Store Manager', slug: 'store-manager' }],
    createdAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-02-10T10:00:00.000Z',
  },
];

const mockRoles: RoleSummaryItem[] = [
  {
    id: 'role-01',
    name: 'Super Administrator',
    slug: 'super-admin',
    type: 'SUPER_ADMIN',
    description: 'Full system control',
    isSystem: true,
    permissionsCount: 74,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'role-02',
    name: 'Store Manager',
    slug: 'store-manager',
    type: 'CUSTOM',
    description: 'Operational manager',
    isSystem: false,
    permissionsCount: 45,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

function setupPermissions(permissions: string[], isSuperAdmin = false) {
  vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
    user: {
      id: 'user-01',
      email: 'superadmin@diano.com.bd',
      name: 'Super Administrator',
      roles: ['super-admin'],
      permissions: ['*'],
      isSuperAdmin: true,
      phone: null,
    },
    permissions,
    roles: isSuperAdmin ? ['super-admin'] : ['manager'],
    isSuperAdmin,
    isLoading: false,
    isAuthenticated: true,
    hasPermission: (perm) => permissions.includes(perm) || isSuperAdmin,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
  });
}

describe('Phase 9B: Staff Management', () => {
  let mockFetchStaff: ReturnType<typeof vi.spyOn>;
  let mockFetchRoles: ReturnType<typeof vi.spyOn>;
  let mockCreateStaff: ReturnType<typeof vi.spyOn>;
  let mockUpdateStatus: ReturnType<typeof vi.spyOn>;
  let mockDeleteStaff: ReturnType<typeof vi.spyOn>;
  let mockRevokeSessions: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setupPermissions(['user:read', 'user:create', 'user:update', 'user:manage', 'user:delete', 'role:read'], true);

    mockFetchStaff = vi.spyOn(staffApi, 'fetchStaffUsers').mockResolvedValue({
      users: mockStaffUsers,
      total: 2,
      page: 1,
      limit: 20,
    });

    mockFetchRoles = vi.spyOn(rolesApi, 'fetchRolesList').mockResolvedValue(mockRoles);

    mockCreateStaff = vi.spyOn(staffApi, 'createStaffUser').mockResolvedValue({
      id: 'user-03',
      name: 'Rahim Uddin',
      email: 'rahim@diano.com.bd',
      phone: '+8801912345678',
      avatarUrl: null,
      status: 'ACTIVE',
      roles: [mockRoles[1]!],
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    });

    mockUpdateStatus = vi.spyOn(staffApi, 'updateStaffStatus').mockResolvedValue({
      ...mockStaffUsers[1]!,
      status: 'SUSPENDED',
    });

    mockDeleteStaff = vi.spyOn(staffApi, 'deleteStaffUser').mockResolvedValue(undefined);

    mockRevokeSessions = vi.spyOn(staffApi, 'revokeStaffSessions').mockResolvedValue(undefined);
  });

  describe('1. Staff Table & Rendering', () => {
    it('renders staff list with member details, roles, and status badges', async () => {
      render(
        <AppProviders>
          <StaffManager />
        </AppProviders>
      );

      expect(await screen.findByText('superadmin@diano.com.bd')).toBeInTheDocument();
      expect(screen.getAllByText('Super Administrator').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Tanvir Hossain')).toBeInTheDocument();
      expect(screen.getByText('tanvir@diano.com.bd')).toBeInTheDocument();
      expect(screen.getByText('01812345678')).toBeInTheDocument();
      expect(screen.getAllByText('Store Manager').length).toBeGreaterThanOrEqual(1);
      expect(mockFetchStaff).toHaveBeenCalled();
      expect(mockFetchRoles).toHaveBeenCalled();
    });
  });

  describe('2. Staff Create & Privilege Escalation Checks', () => {
    it('submits valid staff creation and calls createStaffUser mutation', async () => {
      render(
        <AppProviders>
          <StaffManager />
        </AppProviders>
      );

      const createBtn = await screen.findByRole('button', { name: /invite \/ create staff/i });
      fireEvent.click(createBtn);

      fireEvent.change(screen.getByLabelText(/Full Name \*/i), {
        target: { value: 'Rahim Uddin' },
      });
      fireEvent.change(screen.getByLabelText(/Email Address \*/i), {
        target: { value: 'rahim@diano.com.bd' },
      });
      fireEvent.change(screen.getByLabelText(/Phone/i), {
        target: { value: '+8801912345678' },
      });

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockCreateStaff).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Rahim Uddin',
            email: 'rahim@diano.com.bd',
            phone: '+8801912345678',
          })
        );
      });
    });

    it('displays backend error as-is when privilege escalation or conflict occurs', async () => {
      mockCreateStaff.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Privilege escalation denied: You cannot create a user with a role equal to or higher than your own tier',
          },
        },
      });

      render(
        <AppProviders>
          <StaffManager />
        </AppProviders>
      );

      fireEvent.click(await screen.findByRole('button', { name: /invite \/ create staff/i }));

      fireEvent.change(screen.getByLabelText(/Full Name \*/i), {
        target: { value: 'Privilege Test' },
      });
      fireEvent.change(screen.getByLabelText(/Email Address \*/i), {
        target: { value: 'priv@diano.com.bd' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      expect(
        await screen.findByText(/Privilege escalation denied/i)
      ).toBeInTheDocument();
    });
  });

  describe('3. Account Status & Safety Guards', () => {
    it('suspends an active user account via ConfirmDialog', async () => {
      render(
        <AppProviders>
          <StaffManager />
        </AppProviders>
      );

      expect(await screen.findByText('Tanvir Hossain')).toBeInTheDocument();

      const suspendBtns = screen.getAllByTitle('Suspend account');
      fireEvent.click(suspendBtns[1]!);

      expect(await screen.findByText(/Suspend Staff Account/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /Suspend Account/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockUpdateStatus).toHaveBeenCalledWith('user-02', 'SUSPENDED');
      });
    });

    it('displays exact backend safety error when attempting to deactivate self or last super admin', async () => {
      mockDeleteStaff.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Safety policy violation: Cannot delete the last active Super Administrator',
          },
        },
      });

      render(
        <AppProviders>
          <StaffManager />
        </AppProviders>
      );

      expect(await screen.findByText('superadmin@diano.com.bd')).toBeInTheDocument();

      const deleteBtns = screen.getAllByTitle('Deactivate account');
      fireEvent.click(deleteBtns[0]!);

      expect(await screen.findByText(/Deactivate Staff Account/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /Deactivate Account/i });
      fireEvent.click(confirmBtn);

      expect(
        await screen.findByText(/Safety policy violation: Cannot delete the last active Super Administrator/i)
      ).toBeInTheDocument();
    });

    it('revokes active user sessions via ConfirmDialog', async () => {
      render(
        <AppProviders>
          <StaffManager />
        </AppProviders>
      );

      expect(await screen.findByText('Tanvir Hossain')).toBeInTheDocument();

      const revokeBtns = screen.getAllByTitle('Revoke all active sessions');
      fireEvent.click(revokeBtns[1]!);

      expect(await screen.findByText(/Terminate User Sessions/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /Revoke Sessions/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockRevokeSessions).toHaveBeenCalledWith('user-02');
      });
    });
  });

  describe('4. Permission Gates', () => {
    it('hides create and mutating action buttons when user lacks permissions', async () => {
      setupPermissions(['user:read'], false);

      render(
        <AppProviders>
          <StaffManager />
        </AppProviders>
      );

      expect(await screen.findByText('superadmin@diano.com.bd')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /invite \/ create staff/i })).not.toBeInTheDocument();
      expect(screen.queryByTitle('Edit user details')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Suspend account')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Deactivate account')).not.toBeInTheDocument();
    });
  });
});
