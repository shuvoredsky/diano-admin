import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { ApiClientError } from '@/lib/api/api-error';
import { createRequestAbortController, normalizeAxiosError } from '@/lib/api/browser-client';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth/token-store';

describe('API Error Normalization & Token Store', () => {
  it('stores and clears access token in memory without web storage', () => {
    setAccessToken('jwt-access-token');
    expect(getAccessToken()).toBe('jwt-access-token');
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it('normalizes backend ApiErrorResponse payloads into ApiClientError', () => {
    const headers = new AxiosHeaders();
    const axiosError = new AxiosError(
      'Request failed with status code 422',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 422,
        statusText: 'Unprocessable Entity',
        headers,
        config: { headers },
        data: {
          success: false,
          message: 'Validation failed',
          errors: [{ field: 'email', message: 'Invalid email address' }],
          requestId: 'req-123',
        },
      }
    );

    const normalized = normalizeAxiosError(axiosError);
    expect(normalized).toBeInstanceOf(ApiClientError);
    expect(normalized.statusCode).toBe(422);
    expect(normalized.message).toBe('Validation failed');
    expect(normalized.requestId).toBe('req-123');
  });

  it('creates an AbortController for request cancellation', () => {
    const controller = createRequestAbortController();
    expect(controller.signal.aborted).toBe(false);
    controller.abort();
    expect(controller.signal.aborted).toBe(true);
  });
});
