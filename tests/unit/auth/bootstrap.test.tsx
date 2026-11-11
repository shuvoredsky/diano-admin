import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AppProviders } from '@/components/providers/app-providers';
import { usePermissions } from '@/hooks/use-permissions';
import * as authApi from '@/features/auth/api/auth.api';

function DummyConsumer() {
  const { user, permissions, isAuthenticated, isLoading } = usePermissions();
  if (isLoading) {
    return <div>Loading Session...</div>;
  }
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'AUTHENTICATED' : 'ANONYMOUS'}</div>
      <div data-testid="user-email">{user?.email || 'none'}</div>
      <div data-testid="perm-count">{permissions.length}</div>
    </div>
  );
}

describe('Session Bootstrap Provider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('populates Redux and React Query state upon successful session refresh and me query', async () => {
    vi.spyOn(authApi, 'refreshAdminSession').mockResolvedValue({
      user: {
        id: 'usr-1',
        email: 'staff@diano.com.bd',
        name: 'Staff Member',
        roles: ['manager'],
        permissions: ['order:read', 'order:manage'],
        isSuperAdmin: false,
      },
      accessToken: 'refreshed-jwt-token',
    });

    vi.spyOn(authApi, 'getCurrentAdminProfile').mockResolvedValue({
      id: 'usr-1',
      email: 'staff@diano.com.bd',
      name: 'Staff Member',
      roles: ['manager'],
      permissions: ['order:read', 'order:manage', 'product:read'],
      isSuperAdmin: false,
    });

    render(
      <AppProviders>
        <DummyConsumer />
      </AppProviders>
    );

    // Initial render should show loading splash without flashing protected content
    expect(screen.getByText('Loading Session...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('AUTHENTICATED');
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('staff@diano.com.bd');
    expect(screen.getByTestId('perm-count')).toHaveTextContent('3');
  });

  it('handles refresh failure gracefully setting unauthenticated state', async () => {
    vi.spyOn(authApi, 'refreshAdminSession').mockRejectedValue(new Error('No active refresh session'));

    render(
      <AppProviders>
        <DummyConsumer />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('ANONYMOUS');
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('none');
    expect(screen.getByTestId('perm-count')).toHaveTextContent('0');
  });
});
