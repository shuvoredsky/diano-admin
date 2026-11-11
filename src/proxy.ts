import { type NextRequest, NextResponse } from 'next/server';

import { AUTH_COOKIE_NAMES, evaluateProxyRequest } from '@/lib/auth/proxy-guard';

/**
 * Official Next.js 16 Proxy convention (`src/proxy.ts`).
 * Performs lightweight, optimistic route interception using the HttpOnly refresh cookie signal.
 * Never performs slow database or external API calls here, and never treats cookie presence as authorization proof.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const hasRefreshCookie = Boolean(
    request.cookies.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value
  );

  const decision = evaluateProxyRequest({
    pathname,
    search,
    hasRefreshCookie,
  });

  if (decision.action === 'redirect' && decision.destination) {
    return NextResponse.redirect(new URL(decision.destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ],
};
