import { describe, expect, it } from 'vitest';

import { evaluateProxyRequest, sanitizeReturnUrl } from '@/lib/auth/proxy-guard';

describe('Next.js 16 Proxy Guard & Open-Redirect Sanitizer', () => {
  it('blocks external and protocol-relative returnUrl values', () => {
    expect(sanitizeReturnUrl('https://evil.example.com')).toBe('/admin');
    expect(sanitizeReturnUrl('//evil.example.com')).toBe('/admin');
    expect(sanitizeReturnUrl('/\\evil.example.com')).toBe('/admin');
    expect(sanitizeReturnUrl('/admin/orders?page=2')).toBe('/admin/orders?page=2');
  });

  it('redirects unauthenticated requests for /admin/* to /login with returnUrl', () => {
    const decision = evaluateProxyRequest({
      pathname: '/admin/products',
      search: '?page=3',
      hasRefreshCookie: false,
    });
    expect(decision).toEqual({
      action: 'redirect',
      destination: '/login?returnUrl=%2Fadmin%2Fproducts%3Fpage%3D3',
    });
  });

  it('allows authenticated requests to /admin/* when refresh cookie is present', () => {
    const decision = evaluateProxyRequest({
      pathname: '/admin/orders',
      search: '',
      hasRefreshCookie: true,
    });
    expect(decision).toEqual({ action: 'next' });
  });

  it('redirects authenticated users away from /login to /admin', () => {
    const decision = evaluateProxyRequest({
      pathname: '/login',
      search: '',
      hasRefreshCookie: true,
    });
    expect(decision).toEqual({
      action: 'redirect',
      destination: '/admin',
    });
  });
});
