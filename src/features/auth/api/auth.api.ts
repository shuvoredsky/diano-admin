import axios from 'axios';
import { api } from '@/lib/api/browser-client';
import { setAccessToken, clearAccessToken } from '@/lib/auth/token-store';
import { emitSessionExpired, emitTokenRefreshed } from '@/lib/auth/auth-events';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  AuthSessionResponse,
  AuthUserSummary,
  ForgotPasswordPayload,
  LoginCredentials,
  ResetPasswordPayload,
} from '../types/auth.types';

/**
 * Executes admin login via the same-origin Next.js BFF Route Handler (/api/auth/admin/login).
 * The HttpOnly refresh cookie is bound to the Next.js origin and the short-lived access token
 * is stored exclusively in memory.
 */
export async function loginAdmin(credentials: LoginCredentials): Promise<AuthSessionResponse> {
  try {
    const response = await axios.post<ApiSuccessResponse<AuthSessionResponse>>(
      '/api/auth/admin/login',
      credentials,
      { withCredentials: true }
    );
    const session = response.data.data;
    if (!session?.accessToken) {
      throw new Error('Authentication response did not return a valid session');
    }
    setAccessToken(session.accessToken);
    emitTokenRefreshed(session.accessToken);
    return session;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      const msg = typeof data?.message === 'string' ? data.message : '';

      if (status === 401) {
        throw new Error('Invalid email or password', { cause: error });
      }
      if (status === 403) {
        throw new Error(msg || 'Access denied. Administrator privileges required.', { cause: error });
      }
      if (status === 429) {
        throw new Error(msg || 'Too many login attempts. Please try again later.', { cause: error });
      }
      if (msg) {
        throw new Error(msg, { cause: error });
      }
    }
    if (error instanceof Error && error.message !== 'Network Error') {
      throw error;
    }
    throw new Error('Unable to connect to the authentication server. Please check your connection.', { cause: error });
  }
}

/**
 * Rotates the refresh token via the BFF Route Handler (/api/auth/refresh).
 */
export async function refreshAdminSession(): Promise<AuthSessionResponse> {
  const response = await axios.post<ApiSuccessResponse<AuthSessionResponse>>(
    '/api/auth/refresh',
    {},
    { withCredentials: true }
  );
  const session = response.data.data;
  if (!session?.accessToken) {
    throw new Error('Refresh response did not return an access token');
  }
  setAccessToken(session.accessToken);
  emitTokenRefreshed(session.accessToken);
  return session;
}

/**
 * Logs out the current admin session.
 * Clears the HttpOnly refresh cookie via BFF and clears client in-memory token and caches.
 * Client state is always cleared even if the upstream network call fails.
 */
export async function logoutAdmin(): Promise<void> {
  try {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
  } catch {
    // Ignore network failures during logout - client must still be cleaned up
  } finally {
    clearAccessToken();
    emitSessionExpired();
  }
}

/**
 * Fetches the authenticated admin user profile (/api/v1/auth/me).
 */
export async function getCurrentAdminProfile(signal?: AbortSignal): Promise<AuthUserSummary> {
  const response = await api.get<AuthUserSummary>('/auth/me', { signal });
  return response.data;
}

export async function requestPasswordReset(payload: ForgotPasswordPayload): Promise<void> {
  await api.post<null, ForgotPasswordPayload>('/auth/forgot-password', payload);
}

export async function confirmPasswordReset(payload: ResetPasswordPayload): Promise<void> {
  await api.post<null, ResetPasswordPayload>('/auth/reset-password', payload);
}
