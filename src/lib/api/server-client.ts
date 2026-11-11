import { getServerEnv } from '@/config/env';
import { AUTH_HEADERS } from '@/constants/auth';
import { ApiClientError } from './api-error';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/api.types';

export interface ServerRequestOptions extends Omit<RequestInit, 'headers'> {
  accessToken?: string;
  cookieHeader?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/**
 * Server-only API client for Next.js React Server Components (RSC) and Route Handlers.
 * Communicates directly with `BACKEND_API_URL/api/v1` without exposing internal URLs to the browser.
 */
export async function serverApiFetch<T>(
  endpointPath: string,
  options: ServerRequestOptions = {},
): Promise<ApiSuccessResponse<T>> {
  const serverEnv = getServerEnv();
  const normalizedPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  const url = `${serverEnv.BACKEND_API_URL.replace(/\/$/, '')}/api/v1${normalizedPath}`;

  const { accessToken, cookieHeader, headers = {}, timeoutMs = 15000, ...restInit } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    // Set Origin to NEXT_PUBLIC_APP_URL so diano-server's verifyCookieOrigin CSRF check passes
    Origin: serverEnv.NEXT_PUBLIC_APP_URL,
    ...headers,
  };

  if (accessToken) {
    requestHeaders[AUTH_HEADERS.AUTHORIZATION] = `Bearer ${accessToken}`;
  }
  if (cookieHeader) {
    requestHeaders.Cookie = cookieHeader;
  }

  try {
    const response = await fetch(url, {
      ...restInit,
      headers: requestHeaders,
      signal: restInit.signal ?? controller.signal,
      cache: restInit.cache ?? 'no-store',
    });

    const payload = (await response.json().catch(() => null)) as
      | ApiSuccessResponse<T>
      | ApiErrorResponse
      | null;

    if (!response.ok || !payload || !payload.success) {
      const errorPayload = payload as ApiErrorResponse | null;
      throw new ApiClientError({
        message: errorPayload?.message ?? `Upstream API error (${response.status})`,
        statusCode: errorPayload?.statusCode ?? response.status,
        errors: errorPayload?.errors,
        requestId:
          errorPayload?.requestId ??
          response.headers.get(AUTH_HEADERS.REQUEST_ID) ??
          undefined,
      });
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiClientError({
        message: 'Server API request timed out or was aborted',
        statusCode: 408,
        isCanceled: true,
      });
    }
    throw new ApiClientError({
      message: error instanceof Error ? error.message : 'Failed to reach upstream backend server',
      statusCode: 503,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

