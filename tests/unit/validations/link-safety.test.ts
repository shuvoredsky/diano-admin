import { describe, expect, it } from 'vitest';
import { isSafeUrl } from '@/lib/validations/link-safety';
import { sanitizeHtml } from '@/lib/validations/html-sanitizer';

describe('Security Hardening: Link Safety & DOMPurify HTML Sanitizer', () => {
  describe('1. isSafeUrl URL Safety Validator', () => {
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

    it('rejects malformed internal paths starting with /\\ or \\', () => {
      expect(isSafeUrl('/\\evil.com')).toBe(false);
      expect(isSafeUrl('\\evil.com')).toBe(false);
    });

    it('rejects dangerous pseudo-protocols', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('javascript:void(0)')).toBe(false);
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
      expect(isSafeUrl('file:///etc/passwd')).toBe(false);
    });

    it('rejects encoded, case-varied, and whitespace-obfuscated variants', () => {
      expect(isSafeUrl('java\tscript:alert(1)')).toBe(false);
      expect(isSafeUrl('\njavascript:alert(1)')).toBe(false);
      expect(isSafeUrl('javascript&colon;alert(1)')).toBe(false);
      expect(isSafeUrl('JAVASCRIPT:alert(1)')).toBe(false);
      expect(isSafeUrl('  javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('  JAVASCRIPT:void(0)  ')).toBe(false);
      expect(isSafeUrl('java\r\nscript:alert(1)')).toBe(false);
      expect(isSafeUrl('javascript&#58;alert(1)')).toBe(false);
    });

    it('handles empty and null values gracefully when optional', () => {
      expect(isSafeUrl('')).toBe(true);
      expect(isSafeUrl(null)).toBe(true);
      expect(isSafeUrl(undefined)).toBe(true);
    });
  });

  describe('2. DOMPurify HTML Sanitizer & XSS Defense', () => {
    it('removes <script> blocks and remote script tags completely', () => {
      const input = '<p>Hello</p><script>alert("xss")</script><span>World</span>';
      expect(sanitizeHtml(input)).toBe('<p>Hello</p><span>World</span>');

      const remoteScript = '<p>Content</p><script src="https://evil.com/xss.js"></script>';
      expect(sanitizeHtml(remoteScript)).toBe('<p>Content</p>');
    });

    it('removes inline event handlers on any element (img, a, div, span)', () => {
      const imgPayload = '<img src="x" onerror="alert(document.cookie)" />';
      const sanitizedImg = sanitizeHtml(imgPayload);
      expect(sanitizedImg).not.toContain('onerror');
      expect(sanitizedImg).not.toContain('alert');

      const divPayload = '<div onmouseover="alert(\'hover\')" onclick="alert(\'click\')">Hover me</div>';
      const sanitizedDiv = sanitizeHtml(divPayload);
      expect(sanitizedDiv).not.toContain('onmouseover');
      expect(sanitizedDiv).not.toContain('onclick');
    });

    it('strips <svg onload> and other SVG vector attacks', () => {
      const svgPayload = '<svg onload="alert(1)"><circle cx="50" cy="50" r="40"/></svg>';
      const sanitized = sanitizeHtml(svgPayload);
      expect(sanitized).not.toContain('<svg');
      expect(sanitized).not.toContain('onload');
      expect(sanitized).not.toContain('alert');
    });

    it('strips javascript: URIs with tab/newline and entity encodings in links', () => {
      const direct = '<a href="javascript:alert(1)">Click</a>';
      expect(sanitizeHtml(direct)).not.toContain('javascript:');

      const tabEncoded = '<a href="java\tscript:alert(1)">Tab</a>';
      expect(sanitizeHtml(tabEncoded)).not.toContain('javascript:');

      const entityEncoded = '<a href="javascript&colon;alert(1)">Entity</a>';
      expect(sanitizeHtml(entityEncoded)).not.toContain('javascript:');

      const newlineEncoded = '<a href="java\nscript:alert(1)">Newline</a>';
      expect(sanitizeHtml(newlineEncoded)).not.toContain('javascript:');
    });

    it('strips dangerous data: URIs and vbscript: URIs', () => {
      const dataUri = '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Data XSS</a>';
      expect(sanitizeHtml(dataUri)).not.toContain('data:text/html');

      const vbscript = '<a href="vbscript:msgbox(1)">VBScript</a>';
      expect(sanitizeHtml(vbscript)).not.toContain('vbscript:');
    });

    it('neutralizes nested and malformed tags', () => {
      const nested = '<<SCRIPT>alert("XSS");//<</SCRIPT>';
      const sanitized = sanitizeHtml(nested);
      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('alert("XSS")');
    });

    it('neutralizes mutation-XSS vectors and container tags', () => {
      const mXss = '<math><mtext><table><mglyph><style><!--</style><img src=x onerror=alert(1)>';
      const sanitized = sanitizeHtml(mXss);
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('alert(1)');
      expect(sanitized).not.toContain('<math');
      expect(sanitized).not.toContain('<style');

      const formPayload = '<form><button formaction="javascript:alert(1)">Submit</button></form>';
      const sanitizedForm = sanitizeHtml(formPayload);
      expect(sanitizedForm).not.toContain('<form');
      expect(sanitizedForm).not.toContain('formaction');

      const iframePayload = '<iframe src="javascript:alert(1)"></iframe>';
      expect(sanitizeHtml(iframePayload)).toBe('');
    });

    it('preserves safe formatting tags and safe links', () => {
      const safe = '<p>Welcome to <strong>DIANO</strong>. <em>Heritage</em> handcrafted.</p>';
      expect(sanitizeHtml(safe)).toBe(safe);

      const safeLink = '<a href="/policies/privacy">Privacy</a>';
      expect(sanitizeHtml(safeLink)).toBe('<a href="/policies/privacy">Privacy</a>');

      const mailto = '<a href="mailto:support@diano.com.bd">Support</a>';
      expect(sanitizeHtml(mailto)).toBe(mailto);

      const tel = '<a href="tel:+8801700000000">Call</a>';
      expect(sanitizeHtml(tel)).toBe(tel);
    });

    it('automatically adds rel="noopener noreferrer" on target="_blank" links', () => {
      const link = '<a href="https://diano.com.bd" target="_blank">External Store</a>';
      const sanitized = sanitizeHtml(link);
      expect(sanitized).toContain('rel="noopener noreferrer"');
      expect(sanitized).toContain('target="_blank"');
    });

    it('handles empty, null, and undefined input safely', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
    });
  });
});
