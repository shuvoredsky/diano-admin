import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import axios, { type InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { browserApiClient } from '@/lib/api/browser-client';
import { getAccessToken, setAccessToken, clearAccessToken } from '@/lib/auth/token-store';
import { onSessionExpired } from '@/lib/auth/auth-events';

describe('Auth API Client: Single-Flight 401 Token Refresh Queue', () => {
  const originalAdapter = browserApiClient.defaults.adapter;

  beforeEach(() => {
    clearAccessToken();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    browserApiClient.defaults.adapter = originalAdapter;
    clearAccessToken();
    vi.restoreAllMocks();
  });

  it('triggers exactly ONE refresh call when 3 concurrent requests fail with 401 and replays all 3', async () => {
    setAccessToken('expired-access-token');

    let refreshCallCount = 0;
    vi.spyOn(axios, 'post').mockImplementation(async (url: string) => {
      if (url === '/api/auth/refresh') {
        refreshCallCount++;
        return {
          data: {
            success: true,
            statusCode: 200,
            message: 'Refreshed',
            data: { accessToken: 'fresh-valid-token' },
          },
        };
      }
      return { data: {} };
    });

    let requestsReceived = 0;
    // Set custom adapter on browserApiClient to simulate backend 401 on expired token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    browserApiClient.defaults.adapter = async (config: any) => {
      requestsReceived++;
      const authHeader = config.headers?.Authorization || config.headers?.get?.('Authorization');

      if (authHeader === 'Bearer expired-access-token') {
        const error = new axios.AxiosError('Unauthorized', '401', config, null, {
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
          data: { success: false, statusCode: 401, message: 'Token expired' },
        });
        return Promise.reject(error);
      }

      if (authHeader === 'Bearer fresh-valid-token') {
        return {
          data: { success: true, data: { orderId: 'ord-123' } },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }

      throw new Error(`Unexpected auth header: ${String(authHeader)}`);
    };

    // Fire 3 concurrent requests simultaneously
    const [res1, res2, res3] = await Promise.all([
      browserApiClient.get('/orders/1'),
      browserApiClient.get('/orders/2'),
      browserApiClient.get('/orders/3'),
    ]);

    // Exactly 1 refresh call was made
    expect(refreshCallCount).toBe(1);

    // In-memory token store updated with fresh token
    expect(getAccessToken()).toBe('fresh-valid-token');

    // All 3 requests replayed and succeeded
    expect(res1.data.success).toBe(true);
    expect(res2.data.success).toBe(true);
    expect(res3.data.success).toBe(true);
    expect(requestsReceived).toBe(6); // 3 failed initial + 3 retried
  });

  it('triggers full cleanup and session expired event when token refresh fails', async () => {
    setAccessToken('expired-access-token');

    vi.spyOn(axios, 'post').mockImplementation(async (url: string) => {
      if (url === '/api/auth/refresh') {
        throw new axios.AxiosError('Refresh token expired', '401', undefined, null, {
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
          data: { success: false, statusCode: 401, message: 'Invalid or revoked refresh token' },
        });
      }
      return { data: {} };
    });

    let sessionExpiredTriggered = false;
    const unsub = onSessionExpired(() => {
      sessionExpiredTriggered = true;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    browserApiClient.defaults.adapter = async (config: any) => {
      const error = new axios.AxiosError('Unauthorized', '401', config, null, {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
        data: { success: false, statusCode: 401, message: 'Token expired' },
      });
      return Promise.reject(error);
    };

    await expect(browserApiClient.get('/products')).rejects.toThrow();

    expect(getAccessToken()).toBeNull();
    expect(sessionExpiredTriggered).toBe(true);
    unsub();
  });

  it('never retries auth endpoints themselves to avoid infinite loops', async () => {
    const mockAxiosPost = vi.spyOn(axios, 'post');

    const authEndpoints = ['/auth/login', '/auth/admin/login', '/auth/refresh', '/api/auth/refresh'];

    for (const url of authEndpoints) {
      const config = {
        url,
        method: 'POST',
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      const error = new axios.AxiosError('Unauthorized', '401', config, null, {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
        data: { success: false, statusCode: 401, message: 'Bad credentials' },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect((browserApiClient.interceptors.response as any).handlers[0].rejected(error)).rejects.toThrow();
    }

    // Refresh was NEVER called for auth endpoint failures
    expect(mockAxiosPost).not.toHaveBeenCalled();
  });

  it('multi-tab synchronization: concurrent refreshes across simulated tabs trigger only one refresh network call', async () => {
    let networkRefreshCalls = 0;
    const mockAxiosPost = vi.spyOn(axios, 'post').mockImplementation(async (url: string) => {
      if (url === '/api/auth/refresh') {
        networkRefreshCalls++;
        return {
          data: {
            success: true,
            statusCode: 200,
            data: { accessToken: 'shared-multi-tab-token' },
          },
        };
      }
      return { data: {} };
    });

    // Mock navigator.locks using Object.defineProperty to simulate web lock execution across tabs
    let lockQueue = Promise.resolve();
    const originalLocks = (navigator as any).locks;
    Object.defineProperty(navigator, 'locks', {
      value: {
        request: vi.fn(async (_name: string, callback: () => Promise<string>) => {
          const run = lockQueue.then(() => callback());
          lockQueue = run.then(() => undefined, () => undefined);
          return run;
        }),
      },
      configurable: true,
      writable: true,
    });

    const { executeTokenRefresh } = await import('@/lib/api/browser-client');

    // Simulate Tab 1 and Tab 2 invoking token refresh simultaneously
    const [tokenTab1, tokenTab2] = await Promise.all([
      executeTokenRefresh(),
      executeTokenRefresh(),
    ]);

    expect(tokenTab1).toBe('shared-multi-tab-token');
    expect(tokenTab2).toBe('shared-multi-tab-token');
    // Only Tab 1 executed the network POST, Tab 2 reused the token from Tab 1
    expect(networkRefreshCalls).toBe(1);

    mockAxiosPost.mockRestore();
    if (originalLocks !== undefined) {
      Object.defineProperty(navigator, 'locks', { value: originalLocks, configurable: true, writable: true });
    } else {
      delete (navigator as any).locks;
    }
  });
});
