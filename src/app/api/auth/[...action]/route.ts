import { NextResponse, type NextRequest } from 'next/server';
import { getServerEnv } from '@/config/env';
import { AUTH_COOKIE_NAMES, AUTH_HEADERS } from '@/constants/auth';

/**
 * Strictly Allowlisted Same-Origin BFF Authentication Route Handler (`/api/auth/[...action]`).
 *
 * Architectural Purpose:
 * `diano-server` sets `diano_refresh_token` with `Path=/api/v1/auth` on the backend origin.
 * In a decoupled deployment (e.g., Admin on port 3001 / `admin.diano.store` and API on port 5000 / Render),
 * a cookie scoped to `Path=/api/v1/auth` on the API domain is not sent to Next.js page navigations (`/admin/*`),
 * preventing `proxy.ts` and Server Components from detecting session presence.
 *
 * Security Controls:
 * 1. Strict path & method allowlist (`admin/login`, `refresh`, `logout`, `logout-all`, `me`). Never acts as an open proxy.
 * 2. Preserves `HttpOnly`, `Secure` (in production), and `SameSite=Lax` when relaying `diano_refresh_token` onto the frontend origin with `Path=/`.
 * 3. Forwards client IP, User-Agent, and Origin headers for backend audit logs and CSRF validation.
 */

const ALLOWED_ACTIONS: Record<string, readonly string[]> = {
  'admin/login': ['POST'],
  refresh: ['POST'],
  logout: ['POST'],
  'logout-all': ['POST'],
  me: ['GET', 'PATCH'],
};

function extractCookieToken(setCookieHeaders: string[], cookieName: string): string | null {
  for (const header of setCookieHeaders) {
    const match = new RegExp(`(?:^|\\s)${cookieName}=([^;]+)`).exec(header);
    if (match && match[1] !== undefined) {
      return decodeURIComponent(match[1]);
    }
  }
  return null;
}

async function handleAuthProxy(
  request: NextRequest,
  context: { params: Promise<{ action: string[] }> },
): Promise<NextResponse> {
  const { action } = await context.params;
  const actionPath = (action ?? []).join('/');
  const allowedMethods = ALLOWED_ACTIONS[actionPath];

  if (!allowedMethods) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 404,
        message: `Unsupported auth proxy route: /api/auth/${actionPath}`,
        timestamp: new Date().toISOString(),
      },
      { status: 404 },
    );
  }

  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 405,
        message: `Method ${request.method} not allowed for /api/auth/${actionPath}`,
        timestamp: new Date().toISOString(),
      },
      { status: 405 },
    );
  }

  const serverEnv = getServerEnv();
  const upstreamUrl = `${serverEnv.BACKEND_API_URL.replace(/\/$/, '')}/api/v1/auth/${actionPath}`;
  const isProd = serverEnv.NODE_ENV === 'production';

  const forwardHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Origin: serverEnv.NEXT_PUBLIC_APP_URL,
  };

  const authHeader = request.headers.get(AUTH_HEADERS.AUTHORIZATION);
  if (authHeader) {
    forwardHeaders[AUTH_HEADERS.AUTHORIZATION] = authHeader;
  }

  const userAgent = request.headers.get('user-agent');
  if (userAgent) {
    forwardHeaders['user-agent'] = userAgent;
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    forwardHeaders['x-forwarded-for'] = forwardedFor;
  }

  const incomingRefreshCookie = request.cookies.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;
  if (incomingRefreshCookie) {
    forwardHeaders.Cookie = `${AUTH_COOKIE_NAMES.REFRESH_TOKEN}=${encodeURIComponent(incomingRefreshCookie)}`;
  }

  let bodyText: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    bodyText = await request.text();
  }

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: bodyText && bodyText.length > 0 ? bodyText : undefined,
      cache: 'no-store',
    });

    const data = await upstreamRes.json().catch(() => ({
      success: false,
      statusCode: upstreamRes.status,
      message: 'Invalid JSON response from upstream auth service',
      timestamp: new Date().toISOString(),
    }));

    const nextRes = NextResponse.json(data, { status: upstreamRes.status });

    const setCookieHeaders =
      typeof upstreamRes.headers.getSetCookie === 'function'
        ? upstreamRes.headers.getSetCookie()
        : upstreamRes.headers.get('set-cookie')
          ? [upstreamRes.headers.get('set-cookie')!]
          : [];

    const rotatedToken = extractCookieToken(setCookieHeaders, AUTH_COOKIE_NAMES.REFRESH_TOKEN);

    if (actionPath === 'logout' || actionPath === 'logout-all') {
      nextRes.cookies.delete(AUTH_COOKIE_NAMES.REFRESH_TOKEN);
    } else if (rotatedToken) {
      nextRes.cookies.set(AUTH_COOKIE_NAMES.REFRESH_TOKEN, rotatedToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return nextRes;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 503,
        message:
          error instanceof Error ? error.message : 'Upstream authentication service unavailable',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}

export const GET = handleAuthProxy;
export const POST = handleAuthProxy;
export const PATCH = handleAuthProxy;

