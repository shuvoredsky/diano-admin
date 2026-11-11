import { AUTH_COOKIE_NAMES } from '@/constants/auth';
import { ADMIN_ROUTES, AUTH_ROUTES, PUBLIC_AUTH_PATHS } from '@/constants/routes';

export interface ProxyDecision {
  action: 'next' | 'redirect';
  destination?: string;
}

/**
 * Validates that a return URL/path is a safe relative internal path and strictly prevents open-redirect attacks.
 * Rejects external hosts, protocol schemes (https:, javascript:, data:), protocol-relative slashes (//),
 * backslashes (/\ or \\), and control characters.
 */
export function sanitizeReturnUrl(rawReturnUrl: string | null | undefined): string {
  if (!rawReturnUrl) {
    return ADMIN_ROUTES.ROOT;
  }

  const trimmed = rawReturnUrl.trim();

  // Must start with a single '/' and not '//' or '/\' or contain any backslashes
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.includes('\\')) {
    return ADMIN_ROUTES.ROOT;
  }

  // Reject any URI scheme e.g. javascript:, data:, https:
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return ADMIN_ROUTES.ROOT;
  }

  // Reject whitespace or ASCII control characters
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    if (code <= 32 || code === 127) {
      return ADMIN_ROUTES.ROOT;
    }
  }

  return trimmed;
}

export const sanitizeReturnTo = sanitizeReturnUrl;

/**
 * Pure, lightweight optimistic route interception evaluator used by Next.js 16 `proxy.ts`.
 *
 * ARCHITECTURAL & SECURITY NOTE:
 * - Cookie presence (`diano_refresh_token`) is strictly an OPTIMISTIC UI SIGNAL for route redirection.
 * - It is NEVER treated as proof of authorization or a valid session.
 * - Actual authentication and RBAC permissions are enforced server-side by diano-server on every API request
 *   and verified by client AuthGate before rendering administrative screens.
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

  // 1. Unauthenticated access to protected /admin/* route -> redirect to /login?returnTo=...
  if (isProtectedAdminRoute && !hasRefreshCookie) {
    const intendedPath = sanitizeReturnUrl(`${pathname}${search}`);
    const encodedReturnTo = encodeURIComponent(intendedPath);
    return {
      action: 'redirect',
      destination: `${AUTH_ROUTES.LOGIN}?returnTo=${encodedReturnTo}`,
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
