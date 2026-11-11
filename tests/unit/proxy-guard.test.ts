import { describe, expect, it } from 'vitest';

import { evaluateProxyRequest, sanitizeReturnUrl, sanitizeReturnTo } from '@/lib/auth/proxy-guard';

describe('Next.js 16 Proxy Guard & Open-Redirect Sanitizer', () => {
  it('blocks external, protocol-relative, and dangerous scheme returnTo values', () => {
    expect(sanitizeReturnUrl('https://evil.example.com')).toBe('/admin');
    expect(sanitizeReturnUrl('//evil.example.com')).toBe('/admin');
    expect(sanitizeReturnUrl('/\\evil.example.com')).toBe('/admin');
    expect(sanitizeReturnUrl('/admin\\evil.com')).toBe('/admin');
    expect(sanitizeReturnUrl('javascript:alert(1)')).toBe('/admin');
    expect(sanitizeReturnUrl('data:text/html,<script>evil()</script>')).toBe('/admin');
    expect(sanitizeReturnTo('/admin/orders?page=2')).toBe('/admin/orders?page=2');
  });

  it('redirects unauthenticated requests for /admin/* to /login with returnTo', () => {
    const decision = evaluateProxyRequest({
      pathname: '/admin/products',
      search: '?page=3',
      hasRefreshCookie: false,
    });
    expect(decision).toEqual({
      action: 'redirect',
      destination: '/login?returnTo=%2Fadmin%2Fproducts%3Fpage%3D3',
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
