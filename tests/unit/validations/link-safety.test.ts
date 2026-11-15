import { describe, expect, it } from 'vitest';
import { isSafeUrl } from '@/lib/validations/link-safety';
import { sanitizeHtml } from '@/lib/validations/html-sanitizer';

describe('Link Safety & HTML Sanitizer Validators', () => {
  describe('isSafeUrl', () => {
    it('accepts safe internal paths starting with a single /', () => {
      expect(isSafeUrl('/')).toBe(true);
      expect(isSafeUrl('/products')).toBe(true);
      expect(isSafeUrl('/categories/men-panjabi')).toBe(true);
      expect(isSafeUrl('/about-us?ref=header')).toBe(true);
    });

    it('accepts safe absolute http and https URLs', () => {
      expect(isSafeUrl('https://example.com')).toBe(true);
      expect(isSafeUrl('https://diano.com.bd/campaigns')).toBe(true);
      expect(isSafeUrl('http://localhost:3000')).toBe(true);
    });

    it('rejects protocol-relative URLs starting with //', () => {
      expect(isSafeUrl('//evil.com')).toBe(false);
      expect(isSafeUrl('//attacker.com/malware')).toBe(false);
    });

    it('rejects malformed internal paths starting with /\\', () => {
      expect(isSafeUrl('/\\evil.com')).toBe(false);
    });

    it('rejects dangerous pseudo-protocols', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('javascript:void(0)')).toBe(false);
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
      expect(isSafeUrl('file:///etc/passwd')).toBe(false);
    });

    it('handles empty and null values gracefully when optional', () => {
      expect(isSafeUrl('')).toBe(true);
      expect(isSafeUrl(null)).toBe(true);
      expect(isSafeUrl(undefined)).toBe(true);
    });
  });

  describe('sanitizeHtml', () => {
    it('removes <script> blocks completely', () => {
      const input = '<p>Hello</p><script>alert("xss")</script><span>World</span>';
      expect(sanitizeHtml(input)).toBe('<p>Hello</p><span>World</span>');
    });

    it('removes inline event handlers like onerror and onclick', () => {
      const input = '<img src="invalid.jpg" onerror="alert(1)" /><button onclick="evil()">Click</button>';
      const cleaned = sanitizeHtml(input);
      expect(cleaned).not.toContain('onerror=');
      expect(cleaned).not.toContain('onclick=');
    });

    it('defangs javascript: URIs in href and src', () => {
      const input = '<a href="javascript:alert(1)">Click</a><img src="javascript:evil()" />';
      const cleaned = sanitizeHtml(input);
      expect(cleaned).not.toContain('javascript:');
      expect(cleaned).toContain('href="#"');
    });
  });
});
