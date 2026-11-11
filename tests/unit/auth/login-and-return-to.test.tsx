import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import LoginPage from '@/app/(auth)/login/page';
import { AppProviders } from '@/components/providers/app-providers';
import * as authApi from '@/features/auth/api/auth.api';
import { sanitizeReturnUrl } from '@/lib/auth/proxy-guard';

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/login',
}));

describe('Login Page & returnTo Open-Redirect Sanitization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    mockReplace.mockReset();
    mockSearchParams = new URLSearchParams();
  });

  describe('returnTo Sanitization Security Checks', () => {
    it('blocks all open-redirect attack vectors and falls back to /admin', () => {
      expect(sanitizeReturnUrl('//attacker.com')).toBe('/admin');
      expect(sanitizeReturnUrl('///attacker.com')).toBe('/admin');
      expect(sanitizeReturnUrl('/\\attacker.com')).toBe('/admin');
      expect(sanitizeReturnUrl('\\attacker.com')).toBe('/admin');
      expect(sanitizeReturnUrl('https://evil.com/phish')).toBe('/admin');
      expect(sanitizeReturnUrl('http://evil.com')).toBe('/admin');
      expect(sanitizeReturnUrl('javascript:alert(document.cookie)')).toBe('/admin');
      expect(sanitizeReturnUrl('data:text/html,<script>evil()</script>')).toBe('/admin');
      expect(sanitizeReturnUrl('vbscript:msgbox(1)')).toBe('/admin');
      expect(sanitizeReturnUrl('/admin\\settings')).toBe('/admin');
      expect(sanitizeReturnUrl('/admin\torders')).toBe('/admin');
      expect(sanitizeReturnUrl('/admin\nproducts')).toBe('/admin');
    });

    it('allows valid safe internal relative paths', () => {
      expect(sanitizeReturnUrl('/admin/orders')).toBe('/admin/orders');
      expect(sanitizeReturnUrl('/admin/products?tab=published&sort=date')).toBe(
        '/admin/products?tab=published&sort=date'
      );
      expect(sanitizeReturnUrl('/admin/settings/general')).toBe('/admin/settings/general');
    });
  });

  describe('Form Validation & Error Mapping', () => {
    it('shows validation errors when submitting invalid email or empty password', async () => {
      render(
        <AppProviders>
          <LoginPage />
        </AppProviders>
      );

      const submitButton = screen.getByRole('button', { name: /Sign In to Portal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid staff email address')).toBeInTheDocument();
      });
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('maps backend 401 to generic message without revealing email existence', async () => {
      vi.spyOn(authApi, 'loginAdmin').mockRejectedValue(new Error('Invalid email or password'));

      render(
        <AppProviders>
          <LoginPage />
        </AppProviders>
      );

      const emailInput = screen.getByLabelText(/Staff Email Address/i);
      const passwordInput = screen.getByLabelText(/^Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In to Portal/i });

      fireEvent.change(emailInput, { target: { value: 'unknown@diano.com.bd' } });
      fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
      });
    });

    it('maps backend 403 lockout message accurately with retry countdown info', async () => {
      vi.spyOn(authApi, 'loginAdmin').mockRejectedValue(
        new Error('Account is temporarily locked due to excessive failed attempts. Try again in 14 minute(s).')
      );

      render(
        <AppProviders>
          <LoginPage />
        </AppProviders>
      );

      const emailInput = screen.getByLabelText(/Staff Email Address/i);
      const passwordInput = screen.getByLabelText(/^Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In to Portal/i });

      fireEvent.change(emailInput, { target: { value: 'locked@diano.com.bd' } });
      fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Account is temporarily locked due to excessive failed attempts. Try again in 14 minute(s).'
        );
      });
    });

    it('navigates to sanitized returnTo destination after successful login', async () => {
      mockSearchParams = new URLSearchParams('returnTo=/admin/orders?page=2');

      vi.spyOn(authApi, 'loginAdmin').mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@diano.com.bd',
          name: 'Super Admin',
          roles: ['super-admin'],
          permissions: ['*'],
          isSuperAdmin: true,
        },
        accessToken: 'valid-token',
      });

      vi.spyOn(authApi, 'getCurrentAdminProfile').mockResolvedValue({
        id: 'admin-1',
        email: 'admin@diano.com.bd',
        name: 'Super Admin',
        roles: ['super-admin'],
        permissions: ['*'],
        isSuperAdmin: true,
      });

      render(
        <AppProviders>
          <LoginPage />
        </AppProviders>
      );

      const emailInput = screen.getByLabelText(/Staff Email Address/i);
      const passwordInput = screen.getByLabelText(/^Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In to Portal/i });

      fireEvent.change(emailInput, { target: { value: 'admin@diano.com.bd' } });
      fireEvent.change(passwordInput, { target: { value: 'AdminPass123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/orders?page=2');
      });
    });

    it('loginAdmin API helper maps real backend 403 lockout and retry countdown correctly', async () => {
      const axios = (await import('axios')).default;
      const axiosError = new axios.AxiosError('Forbidden', '403', undefined, null, {
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        config: {} as any,
        data: {
          success: false,
          statusCode: 403,
          message: 'Account is temporarily locked due to excessive failed attempts. Try again in 15 minute(s).',
        },
      });

      vi.spyOn(axios, 'post').mockRejectedValueOnce(axiosError);

      await expect(
        authApi.loginAdmin({ email: 'locked@diano.com.bd', password: 'password' })
      ).rejects.toThrow('Account is temporarily locked due to excessive failed attempts. Try again in 15 minute(s).');
    });
  });
});
