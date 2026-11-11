import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { publicEnv } from '@/config/env';
import { AUTH_HEADERS } from '@/constants/auth';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth/token-store';
import { emitSessionExpired, emitTokenRefreshed } from '@/lib/auth/auth-events';
import { ApiClientError } from './api-error';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/api.types';
import type { AuthSuccessPayload } from '@/types/auth.types';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Single-flight refresh queue state
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processPendingQueue(error: unknown, newToken: string | null = null): void {
  for (const item of pendingQueue) {
    if (error || !newToken) {
      item.reject(error);
    } else {
      item.resolve(newToken);
    }
  }
  pendingQueue = [];
}

// Multi-tab synchronization via BroadcastChannel (safe fallback when unsupported)
const AUTH_SYNC_CHANNEL_NAME = 'diano_auth_sync';
let authSyncChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    authSyncChannel = new BroadcastChannel(AUTH_SYNC_CHANNEL_NAME);
    authSyncChannel.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === 'TOKEN_REFRESHED' && typeof data.token === 'string') {
        setAccessToken(data.token);
        emitTokenRefreshed(data.token);
      } else if (data?.type === 'SESSION_EXPIRED') {
        clearAccessToken();
        emitSessionExpired(data.returnTo);
      }
    };
  } catch {
    authSyncChannel = null;
  }
}

function broadcastAuthEvent(payload: { type: 'TOKEN_REFRESHED'; token: string } | { type: 'SESSION_EXPIRED'; returnTo?: string }): void {
  try {
    authSyncChannel?.postMessage(payload);
  } catch {
    // Ignore cross-context broadcast errors
  }
}

/**
 * Normalizes any Axios or unknown error into an `ApiClientError`.
 */
export function normalizeAxiosError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (axios.isCancel(error)) {
    return new ApiClientError({
      message: 'Request was canceled',
      statusCode: 499,
      isCanceled: true,
    });
  }

  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    const statusCode = axiosErr.response?.status ?? 500;
    const data = axiosErr.response?.data;
    const message =
      (data && typeof data.message === 'string' && data.message) ||
      axiosErr.message ||
      'An unexpected network error occurred';

    return new ApiClientError({
      message,
      statusCode,
      errors: data?.errors,
      requestId:
        data?.requestId ??
        (axiosErr.response?.headers?.[AUTH_HEADERS.REQUEST_ID] as string | undefined),
    });
  }

  return new ApiClientError({
    message: error instanceof Error ? error.message : 'Unknown API error',
    statusCode: 500,
  });
}

/**
 * Executes a single-flight refresh operation with multi-tab lock protection.
 */
async function executeTokenRefresh(): Promise<string> {
  const performDirectRefresh = async (): Promise<string> => {
    // Call same-origin Next.js BFF Route Handler to rotate the HttpOnly cookie and get new access token
    const refreshResponse = await axios.post<ApiSuccessResponse<AuthSuccessPayload>>(
      '/api/auth/refresh',
      {},
      { withCredentials: true, timeout: 15000 }
    );

    const refreshedToken = refreshResponse.data.data?.accessToken;
    if (!refreshedToken) {
      throw new Error('Refresh response did not return an access token');
    }

    setAccessToken(refreshedToken);
    emitTokenRefreshed(refreshedToken);
    broadcastAuthEvent({ type: 'TOKEN_REFRESHED', token: refreshedToken });

    return refreshedToken;
  };

  // Multi-tab safety: if navigator.locks is supported, ensure only 1 tab executes rotation at a time
  if (typeof navigator !== 'undefined' && 'locks' in navigator && typeof navigator.locks.request === 'function') {
    return navigator.locks.request('diano_auth_refresh_lock', async () => {
      // If another tab refreshed while we waited for the lock, an access token may already be present
      const currentToken = getAccessToken();
      if (currentToken) {
        return currentToken;
      }
      return performDirectRefresh();
    });
  }

  return performDirectRefresh();
}

/**
 * Browser-side Axios instance configured for DIANO backend communication.
 * - Attaches in-memory Bearer access token automatically.
 * - Enables `withCredentials: true` for HttpOnly `diano_refresh_token` rotation.
 * - Handles single-flight 401 token refresh via BFF `/api/auth/refresh`.
 */
export const browserApiClient: AxiosInstance = axios.create({
  baseURL: publicEnv.NEXT_PUBLIC_API_BASE_URL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

browserApiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers && !config.headers.get(AUTH_HEADERS.AUTHORIZATION)) {
    config.headers.set(AUTH_HEADERS.AUTHORIZATION, `Bearer ${token}`);
  }
  return config;
});

browserApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(normalizeAxiosError(error));
    }

    // Never retry auth endpoints to prevent infinite retry loops
    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/admin/login') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/api/auth');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Enqueue concurrent 401s into single-flight pending queue
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.set(AUTH_HEADERS.AUTHORIZATION, `Bearer ${newToken}`);
            return browserApiClient(originalRequest);
          })
          .catch((queueErr) => Promise.reject(normalizeAxiosError(queueErr)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshedToken = await executeTokenRefresh();
        processPendingQueue(null, refreshedToken);

        originalRequest.headers.set(AUTH_HEADERS.AUTHORIZATION, `Bearer ${refreshedToken}`);
        return browserApiClient(originalRequest);
      } catch (refreshErr) {
        clearAccessToken();
        const returnTo = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : undefined;
        emitSessionExpired(returnTo);
        broadcastAuthEvent({ type: 'SESSION_EXPIRED', returnTo });
        processPendingQueue(refreshErr, null);
        return Promise.reject(normalizeAxiosError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeAxiosError(error));
  },
);

/**
 * Helper to create an AbortController for request cancellation.
 */
export function createRequestAbortController(): AbortController {
  return new AbortController();
}

/**
 * Type-safe HTTP request helpers for browser/client usage.
 */
export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const res = await browserApiClient.get<ApiSuccessResponse<T>>(url, config);
    return res.data;
  },
  async post<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<ApiSuccessResponse<T>> {
    const res = await browserApiClient.post<ApiSuccessResponse<T>>(url, body, config);
    return res.data;
  },
  async put<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<ApiSuccessResponse<T>> {
    const res = await browserApiClient.put<ApiSuccessResponse<T>>(url, body, config);
    return res.data;
  },
  async patch<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig,
  ): Promise<ApiSuccessResponse<T>> {
    const res = await browserApiClient.patch<ApiSuccessResponse<T>>(url, body, config);
    return res.data;
  },
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const res = await browserApiClient.delete<ApiSuccessResponse<T>>(url, config);
    return res.data;
  },
};
