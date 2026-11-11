import axios from 'axios';

import { api } from '@/lib/api/browser-client';
import { setAccessToken } from '@/lib/auth/token-store';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  AuthSessionResponse,
  AuthUserSummary,
  ForgotPasswordPayload,
  LoginCredentials,
  ResetPasswordPayload,
} from '../types/auth.types';

/**
 * Executes admin login via the same-origin Next.js BFF Route Handler (/api/auth/admin/login)
 * so the HttpOnly refresh cookie is bound to the Next.js origin (Path=/) and the short-lived
 * access token is stored exclusively in memory.
 */
export async function loginAdmin(credentials: LoginCredentials): Promise<AuthSessionResponse> {
  const response = await axios.post<ApiSuccessResponse<AuthSessionResponse>>(
    '/api/auth/admin/login',
    credentials,
    { withCredentials: true }
  );
  const session = response.data.data;
  setAccessToken(session.accessToken);
  return session;
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
  setAccessToken(session.accessToken);
  return session;
}

/**
 * Logs out the current admin session and clears both the HttpOnly refresh cookie and in-memory token.
 */
export async function logoutAdmin(): Promise<void> {
  try {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
  } finally {
    setAccessToken(null);
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
