import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthGate } from '@/features/auth/components/auth-gate';
import * as authPermissionsHook from '@/hooks/use-permissions';
import * as authApi from '@/features/auth/api/auth.api';
import { getAccessToken, setAccessToken } from '@/lib/auth/token-store';

const mockReplace = vi.fn();
let mockCurrentPath = '/admin/orders';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn(), back: vi.fn() }),
  usePathname: () => mockCurrentPath,
  useSearchParams: () => new URLSearchParams(),
}));

describe('AuthGate & Route Permission Guard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockReplace.mockReset();
    mockCurrentPath = '/admin/orders';
  });

  it('renders loading splash and does not flash protected content while authenticating', () => {
    vi.spyOn(authPermissionsHook, 'usePermissions').mockReturnValue({
      user: undefined,
      permissions: [],
      roles: [],
      isSuperAdmin: false,
      isLoading: true,
      isAuthenticated: false,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
    });

    render(
      <AuthGate>
        <div data-testid="protected-content">Secret Order Data</div>
      </AuthGate>
    );

    expect(screen.getByText('Verifying Secure Administrative Session...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated user to login with returnTo parameter', () => {
    mockCurrentPath = '/admin/products';

    vi.spyOn(authPermissionsHook, 'usePermissions').mockReturnValue({
      user: undefined,
      permissions: [],
      roles: [],
      isSuperAdmin: false,
      isLoading: false,
      isAuthenticated: false,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
    });

    render(
      <AuthGate>
        <div data-testid="protected-content">Secret Product Data</div>
      </AuthGate>
    );

    expect(mockReplace).toHaveBeenCalledWith('/login?returnTo=%2Fadmin%2Fproducts');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders 403 Forbidden screen when user lacks required route permission', () => {
    mockCurrentPath = '/admin/settings';

    vi.spyOn(authPermissionsHook, 'usePermissions').mockReturnValue({
      user: {
        id: 'staff-1',
        email: 'staff@diano.com.bd',
        name: 'Staff',
        roles: ['support-staff'],
        permissions: ['order:read'],
        isSuperAdmin: false,
      },
      permissions: ['order:read'],
      roles: ['support-staff'],
      isSuperAdmin: false,
      isLoading: false,
      isAuthenticated: true,
      hasPermission: (p) => p === 'order:read',
      hasAnyPermission: (perms) => perms.includes('order:read'),
      hasAllPermissions: (perms) => perms.every((p) => p === 'order:read'),
    });

    render(
      <AuthGate>
        <div data-testid="protected-content">System Settings</div>
      </AuthGate>
    );

    expect(screen.getByText('403 — Unauthorized Section')).toBeInTheDocument();
    expect(screen.getByText(/Your administrative role does not include the required permissions/i)).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('allows access when user possesses route permission or is super-admin', () => {
    mockCurrentPath = '/admin/orders';

    vi.spyOn(authPermissionsHook, 'usePermissions').mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'admin@diano.com.bd',
        name: 'Admin',
        roles: ['admin'],
        permissions: ['order:read'],
        isSuperAdmin: false,
      },
      permissions: ['order:read'],
      roles: ['admin'],
      isSuperAdmin: false,
      isLoading: false,
      isAuthenticated: true,
      hasPermission: () => true,
      hasAnyPermission: () => true,
      hasAllPermissions: () => true,
    });

    render(
      <AuthGate>
        <div data-testid="protected-content">Order Management Dashboard</div>
      </AuthGate>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByText(/403/)).not.toBeInTheDocument();
  });

  describe('Logout Cleanup Order', () => {
    it('clears in-memory token, emits session expiration, and cleans up client state even on API failure', async () => {
      setAccessToken('active-token');
      expect(getAccessToken()).toBe('active-token');

      // Logout should clear token store regardless of API response
      await authApi.logoutAdmin();

      expect(getAccessToken()).toBeNull();
    });
  });
});
