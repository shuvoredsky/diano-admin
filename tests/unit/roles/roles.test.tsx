import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AppProviders } from '@/components/providers/app-providers';
import { RolesManager } from '@/features/roles-permissions/components/roles-manager';
import * as rolesApi from '@/features/roles-permissions/api/roles.api';
import * as authPermissionsHook from '@/features/auth/hooks/use-auth-permissions';
import type {
  RoleSummaryItem,
  RoleDetailItem,
  PermissionItem,
} from '@/features/roles-permissions/types/roles.types';

const mockRoles: RoleSummaryItem[] = [
  {
    id: 'role-01',
    name: 'Super Administrator',
    slug: 'super-admin',
    type: 'SUPER_ADMIN',
    description: 'Root access',
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
    description: 'Day-to-day operations',
    isSystem: false,
    permissionsCount: 2,
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
];

const mockCatalog: Record<string, PermissionItem[]> = {
  order: [
    { id: 'p1', name: 'Read Orders', slug: 'order:read', resource: 'order', action: 'read' },
    { id: 'p2', name: 'Manage Orders', slug: 'order:manage', resource: 'order', action: 'manage' },
  ],
  product: [
    { id: 'p3', name: 'Read Products', slug: 'product:read', resource: 'product', action: 'read' },
    { id: 'p4', name: 'Create Products', slug: 'product:create', resource: 'product', action: 'create' },
  ],
};

const mockRoleDetail: RoleDetailItem = {
  id: 'role-02',
  name: 'Store Manager',
  slug: 'store-manager',
  type: 'CUSTOM',
  description: 'Day-to-day operations',
  isSystem: false,
  permissions: [
    { id: 'p1', name: 'Read Orders', slug: 'order:read', resource: 'order', action: 'read' },
    { id: 'p3', name: 'Read Products', slug: 'product:read', resource: 'product', action: 'read' },
  ],
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

function setupPermissions(permissions: string[], userRoles = ['store-manager'], isSuperAdmin = false) {
  vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
    user: {
      id: 'user-02',
      email: 'manager@diano.com.bd',
      name: 'Manager User',
      roles: userRoles,
      permissions: ['*'],
      isSuperAdmin,
      phone: null,
    },
    permissions,
    roles: userRoles,
    isSuperAdmin,
    isLoading: false,
    isAuthenticated: true,
    hasPermission: (perm) => permissions.includes(perm) || isSuperAdmin,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
  });
}

describe('Phase 9B: Roles & Permission Matrix Management', () => {
  let mockFetchRoles: ReturnType<typeof vi.spyOn>;
  let mockGetRoleById: ReturnType<typeof vi.spyOn>;
  let mockFetchCatalog: ReturnType<typeof vi.spyOn>;
  let mockAssignPermissions: ReturnType<typeof vi.spyOn>;
  let mockDeleteRole: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setupPermissions(['role:read', 'role:create', 'role:update', 'role:delete'], ['store-manager'], true);

    mockFetchRoles = vi.spyOn(rolesApi, 'fetchRolesList').mockResolvedValue(mockRoles);
    mockGetRoleById = vi.spyOn(rolesApi, 'getRoleById').mockResolvedValue(mockRoleDetail);
    mockFetchCatalog = vi.spyOn(rolesApi, 'fetchPermissionsCatalog').mockResolvedValue(mockCatalog);
    mockAssignPermissions = vi.spyOn(rolesApi, 'assignPermissionsToRole').mockResolvedValue(mockRoleDetail);
    mockDeleteRole = vi.spyOn(rolesApi, 'deleteRole').mockResolvedValue(undefined);
  });

  describe('1. Roles List & System Protection', () => {
    it('renders roles list with system and custom badges and permissions count', async () => {
      render(
        <AppProviders>
          <RolesManager />
        </AppProviders>
      );

      expect(await screen.findByText('Super Administrator')).toBeInTheDocument();
      expect(screen.getByText('SYSTEM')).toBeInTheDocument();
      expect(screen.getByText('74 permissions')).toBeInTheDocument();

      expect(screen.getByText('Store Manager')).toBeInTheDocument();
      expect(screen.getByText('CUSTOM')).toBeInTheDocument();
      expect(screen.getByText('2 permissions')).toBeInTheDocument();

      expect(mockFetchRoles).toHaveBeenCalled();
    });

    it('disables edit and delete buttons for protected system roles', async () => {
      render(
        <AppProviders>
          <RolesManager />
        </AppProviders>
      );

      await screen.findByText('Super Administrator');

      const editBtns = screen.getAllByTitle(/edit role details|system roles cannot be modified/i);
      const deleteBtns = screen.getAllByTitle(/delete custom role|system roles cannot be deleted/i);

      // System role (Super Admin at index 0) must be disabled
      expect(editBtns[0]).toBeDisabled();
      expect(deleteBtns[0]).toBeDisabled();

      // Custom role (Store Manager at index 1) must be enabled
      expect(editBtns[1]).not.toBeDisabled();
      expect(deleteBtns[1]).not.toBeDisabled();
    });
  });

  describe('2. Permission Matrix & Diff Summary', () => {
    it('renders permissions grouped by module with checkboxes', async () => {
      render(
        <AppProviders>
          <RolesManager />
        </AppProviders>
      );

      // Select Store Manager
      fireEvent.click(await screen.findByText('Store Manager'));

      expect(await screen.findByText(/Permissions Matrix: Store Manager/i)).toBeInTheDocument();
      expect(screen.getByText(/order Module/i)).toBeInTheDocument();
      expect(screen.getByText(/product Module/i)).toBeInTheDocument();
      expect(screen.getByText('Read Orders')).toBeInTheDocument();
      expect(screen.getByText('Manage Orders')).toBeInTheDocument();
      expect(mockFetchCatalog).toHaveBeenCalled();
    });

    it('summarizes added/removed permissions in ConfirmDialog and displays self-lockout warning', async () => {
      render(
        <AppProviders>
          <RolesManager />
        </AppProviders>
      );

      fireEvent.click(await screen.findByText('Store Manager'));
      await screen.findByText(/Permissions Matrix: Store Manager/i);

      // Toggle 'Manage Orders' checkbox (add privilege)
      const manageOrdersCheckbox = screen.getByLabelText(/Manage Orders/i);
      fireEvent.click(manageOrdersCheckbox);

      const saveBtn = screen.getByRole('button', { name: /save permissions/i });
      expect(saveBtn).not.toBeDisabled();
      fireEvent.click(saveBtn);

      // ConfirmDialog must open with diff and self-lockout warning (current user has store-manager role)
      expect(await screen.findByText(/Confirm Permission Changes/i)).toBeInTheDocument();
      expect(screen.getByText(/Self-Lockout Warning/i)).toBeInTheDocument();
      expect(screen.getByText(/Adding/i)).toBeInTheDocument();

      const applyBtn = screen.getByRole('button', { name: /Apply Permission Changes/i });
      fireEvent.click(applyBtn);

      await waitFor(() => {
        expect(mockAssignPermissions).toHaveBeenCalledWith(
          'role-02',
          expect.objectContaining({
            permissionSlugs: expect.arrayContaining(['order:read', 'product:read', 'order:manage']),
          })
        );
      });
    });

    it('locks checkboxes when super-admin role is selected', async () => {
      mockGetRoleById.mockResolvedValueOnce({
        ...mockRoleDetail,
        id: 'role-01',
        name: 'Super Administrator',
        slug: 'super-admin',
        isSystem: true,
      });

      render(
        <AppProviders>
          <RolesManager />
        </AppProviders>
      );

      fireEvent.click(await screen.findByText('Super Administrator'));

      expect(await screen.findByText('INHERENT ROOT ACCESS')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /save permissions/i })).not.toBeInTheDocument();
    });
  });

  describe('3. Delete Role Constraint Handling', () => {
    it('displays backend active assignment error when deleting assigned role', async () => {
      mockDeleteRole.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Cannot delete role [Store Manager] because it is currently assigned to 2 user(s). Reassign them first.',
          },
        },
      });

      render(
        <AppProviders>
          <RolesManager />
        </AppProviders>
      );

      await screen.findByText('Store Manager');

      const deleteBtns = screen.getAllByTitle(/delete custom role/i);
      fireEvent.click(deleteBtns[0]!);

      expect(await screen.findByText(/Delete Role: Store Manager/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /Delete Role/i });
      fireEvent.click(confirmBtn);

      expect(
        await screen.findByText(/Cannot delete role \[Store Manager\] because it is currently assigned to 2 user\(s\)/i)
      ).toBeInTheDocument();
    });
  });
});
