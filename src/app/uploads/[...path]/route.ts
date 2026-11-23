import { NextResponse, type NextRequest } from 'next/server';
import { getServerEnv } from '@/config/env';

/**
 * Same-Origin BFF Proxy Route for Local Uploaded Media (`/uploads/[...path]`).
 *
 * Ensures local disk uploads served by diano-server (port 5000) are seamlessly accessible
 * on the Next.js origin (port 3001) in development environments, avoiding broken images
 * caused by port discrepancies or Turbopack rewrite limitations.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await context.params;
  const relativePath = (path ?? []).join('/');

  if (!relativePath || relativePath.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const serverEnv = getServerEnv();
  const upstreamUrl = `${serverEnv.BACKEND_API_URL.replace(/\/$/, '')}/uploads/${relativePath}`;

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        Accept: request.headers.get('accept') || '*/*',
      },
      cache: 'force-cache',
    });

    if (!upstreamRes.ok) {
      return new NextResponse(null, { status: upstreamRes.status });
    }

    const contentType = upstreamRes.headers.get('content-type') || 'application/octet-stream';
    const body = await upstreamRes.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}

