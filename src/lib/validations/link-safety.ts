/**
 * Link Safety Validator
 * Restricts links and admin-entered URLs to safe schemes:
 * - Internal paths starting with a single '/' (e.g. '/products', '/about')
 * - Absolute HTTP / HTTPS URLs (e.g. 'https://example.com')
 * Rejects:
 * - Protocol-relative URLs ('//evil.com')
 * - Dangerous schemes ('javascript:', 'data:', 'vbscript:', 'file:')
 * - Malformed internal paths ('/\evil.com', '/\example')
 */

export function isSafeUrl(url?: string | null): boolean {
  if (!url) return true; // empty / null is considered valid when optional
  const trimmed = url.trim();
  if (!trimmed) return true;

  // Reject protocol-relative URLs (e.g. "//evil.com")
  if (trimmed.startsWith('//')) {
    return false;
  }

  // Check internal relative paths
  if (trimmed.startsWith('/')) {
    // Disallow if followed by another slash or backslash
    if (trimmed.length > 1 && (trimmed[1] === '/' || trimmed[1] === '\\')) {
      return false;
    }
    // Reject control characters or newlines
    if (/[\r\n\t]/.test(trimmed)) {
      return false;
    }
    return true;
  }

  // For absolute URLs, parse and enforce http: or https:
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
