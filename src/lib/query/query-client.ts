import { QueryClient } from '@tanstack/react-query';
import { isApiClientError } from '@/lib/api/api-error';

/**
 * Factory for TanStack QueryClient with production-grade retry and stale-time defaults.
 *
 * Architecture Rules:
 * - Server data, caching, pagination, mutations, and invalidation live exclusively in TanStack Query.
 * - 4xx client errors (400, 401, 403, 404, 409, 422) are not retried automatically.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute default stale time
        gcTime: 5 * 60 * 1000, // 5 minutes garbage collection time
        refetchOnWindowFocus: false,
        retry(failureCount, error) {
          if (isApiClientError(error)) {
            if (error.isCanceled) return false;
            if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 408) {
              return false;
            }
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

