import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PermissionGate, Can } from '@/components/shared/permission-gate';

// Mock the usePermissions hook
const mockUsePermissions = vi.fn();
vi.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => mockUsePermissions(),
}));

describe('PermissionGate Component', () => {
  it('allows access if user is super-admin regardless of permissions', () => {
    mockUsePermissions.mockReturnValue({
      isSuperAdmin: true,
      isAuthenticated: true,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
    });

    render(
      <PermissionGate permission="settings:manage" fallback={<div>Access Denied</div>}>
        <div>Super Secret Content</div>
      </PermissionGate>
    );

    expect(screen.getByText('Super Secret Content')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it('renders children when user possesses the required permission', () => {
    mockUsePermissions.mockReturnValue({
      isSuperAdmin: false,
      isAuthenticated: true,
      hasPermission: (perm: string) => perm === 'order:read',
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
    });

    render(
      <PermissionGate permission="order:read" fallback={<div>Access Denied</div>}>
        <div>Order Details</div>
      </PermissionGate>
    );

    expect(screen.getByText('Order Details')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it('renders fallback when user lacks required permission', () => {
    mockUsePermissions.mockReturnValue({
      isSuperAdmin: false,
      isAuthenticated: true,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
    });

    render(
      <Can permission="order:delete" fallback={<div>Permission Required</div>}>
        <button>Delete Order</button>
      </Can>
    );

    expect(screen.queryByText('Delete Order')).not.toBeInTheDocument();
    expect(screen.getByText('Permission Required')).toBeInTheDocument();
  });

  it('handles multiple permissions with any / all logic', () => {
    mockUsePermissions.mockReturnValue({
      isSuperAdmin: false,
      isAuthenticated: true,
      hasPermission: () => false,
      hasAnyPermission: (perms: string[]) => perms.includes('product:read'),
      hasAllPermissions: (perms: string[]) => perms.every(p => p === 'product:read'),
    });

    // Has any
    const { rerender } = render(
      <PermissionGate
        permissions={['product:read', 'product:delete']}
        fallback={<div>Denied Any</div>}
      >
        <div>Catalog View</div>
      </PermissionGate>
    );
    expect(screen.getByText('Catalog View')).toBeInTheDocument();

    // Requires all
    rerender(
      <PermissionGate
        permissions={['product:read', 'product:delete']}
        all
        fallback={<div>Denied All</div>}
      >
        <div>Catalog View</div>
      </PermissionGate>
    );
    expect(screen.getByText('Denied All')).toBeInTheDocument();
  });
});
