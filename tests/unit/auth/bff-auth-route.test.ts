import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/auth/[...action]/route';

describe('BFF Auth Route Handler & CSRF Protection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('blocks cross-site POST requests via Sec-Fetch-Site header', async () => {
    const req = new NextRequest('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: {
        'sec-fetch-site': 'cross-site',
        origin: 'http://localhost:3001',
      },
    });

    const res = await POST(req, {
      params: Promise.resolve({ action: ['logout'] }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.message).toContain('Cross-site request blocked by CSRF protection');
  });

  it('blocks POST requests with mismatched Origin header', async () => {
    const req = new NextRequest('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: {
        origin: 'https://evil-attacker.com',
        host: 'localhost:3001',
      },
    });

    const res = await POST(req, {
      params: Promise.resolve({ action: ['logout'] }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.message).toContain('Cross-origin request blocked by CSRF protection');
  });

  it('rejects unsupported methods with 405 Method Not Allowed', async () => {
    const req = new NextRequest('http://localhost:3001/api/auth/logout', {
      method: 'GET',
    });

    const res = await GET(req, {
      params: Promise.resolve({ action: ['logout'] }),
    });

    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.message).toContain('Method GET not allowed');
  });

  it('allows same-origin POST requests and deletes refresh cookie on logout', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ success: true, message: 'Logged out' }),
      headers: {
        getSetCookie: () => [],
        get: () => null,
      },
    } as unknown as Response);

    const req = new NextRequest('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3001',
        host: 'localhost:3001',
      },
    });

    const res = await POST(req, {
      params: Promise.resolve({ action: ['logout'] }),
    });

    expect(res.status).toBe(200);
    const setCookie = res.headers.get('set-cookie');
    // On logout, cookie should be deleted (Expires in past or Max-Age 0)
    expect(setCookie).toBeDefined();
    expect(setCookie).toMatch(/diano_refresh_token=;.*(?:Expires=Thu, 01 Jan 1970|Max-Age=0)/i);
  });
});
