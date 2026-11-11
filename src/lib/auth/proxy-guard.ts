import { AUTH_COOKIE_NAMES } from '@/constants/auth';
import { ADMIN_ROUTES, AUTH_ROUTES, PUBLIC_AUTH_PATHS } from '@/constants/routes';

export interface ProxyDecision {
  action: 'next' | 'redirect';
  destination?: string;
}

/**
 * Validates that a return URL is a safe relative internal path and prevents open-redirect attacks.
 */
export function sanitizeReturnUrl(rawReturnUrl: string | null | undefined): string {
  if (!rawReturnUrl) {
    return ADMIN_ROUTES.ROOT;
  }

  const trimmed = rawReturnUrl.trim();
  // Must start with a single '/' and not '//' or '/\' or contain protocol schemes
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return ADMIN_ROUTES.ROOT;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return ADMIN_ROUTES.ROOT;
  }

  return trimmed;
}

/**
 * Pure, lightweight optimistic route interception evaluator used by Next.js 16 `proxy.ts`.
 *
 * SECURITY NOTE:
 * - Cookie presence (`diano_refresh_token`) is ONLY an optimistic signal for route redirection.
 * - It is NEVER treated as proof of a valid authenticated session or authorization.
 * - Actual session validity and RBAC permissions are verified server-side and by diano-server.
 */
export function evaluateProxyRequest(params: {
  pathname: string;
  search?: string;
  hasRefreshCookie: boolean;
}): ProxyDecision {
  const { pathname, search = '', hasRefreshCookie } = params;

  const isProtectedAdminRoute =
    pathname === ADMIN_ROUTES.ROOT || pathname.startsWith(`${ADMIN_ROUTES.ROOT}/`);

  const isPublicAuthRoute = PUBLIC_AUTH_PATHS.some(
    (authPath) => pathname === authPath || pathname.startsWith(`${authPath}/`),
  );

  // 1. Unauthenticated access to protected /admin/* route -> redirect to /login?returnUrl=...
  if (isProtectedAdminRoute && !hasRefreshCookie) {
    const intendedPath = sanitizeReturnUrl(`${pathname}${search}`);
    const encodedReturnUrl = encodeURIComponent(intendedPath);
    return {
      action: 'redirect',
      destination: `${AUTH_ROUTES.LOGIN}?returnUrl=${encodedReturnUrl}`,
    };
  }

  // 2. Optimistically authenticated user visiting /login -> redirect to /admin
  if (isPublicAuthRoute && pathname === AUTH_ROUTES.LOGIN && hasRefreshCookie) {
    return {
      action: 'redirect',
      destination: ADMIN_ROUTES.ROOT,
    };
  }

  return { action: 'next' };
}

export { AUTH_COOKIE_NAMES };

