/**
 * Link Safety Validator
 * Restricts links and admin-entered URLs to safe schemes:
 * - Internal paths starting with a single '/' (e.g. '/products', '/about')
 * - Absolute HTTP / HTTPS URLs (e.g. 'https://example.com')
 * Rejects:
 * - Protocol-relative URLs ('//evil.com')
 * - Backslash or mixed-slash evasions ('/\\evil.com', '\\evil.com')
 * - Dangerous schemes ('javascript:', 'data:', 'vbscript:', 'file:')
 * - Obfuscated schemes with embedded whitespace/control characters ('java\tscript:', '\njavascript:')
 * - HTML entity-encoded colons ('javascript&colon;')
 * - Case variants ('JAVASCRIPT:', 'Data:')
 */

const DANGEROUS_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:'];

function hasControlCharacters(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // ASCII 0-31 or 127-159 (DEL and C1 controls)
    if ((code >= 0 && code <= 31) || (code >= 127 && code <= 159)) {
      return true;
    }
  }
  return false;
}

export function isSafeUrl(url?: string | null): boolean {
  if (!url) return true; // empty / null is considered valid when optional
  const trimmed = url.trim();
  if (!trimmed) return true;

  // 1. Reject protocol-relative or backslash-leading URLs (e.g. "//evil.com", "/\evil.com", "\evil.com")
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.startsWith('\\')) {
    return false;
  }

  // 2. Reject control characters anywhere in the string
  // Attackers use embedded tabs, newlines, or null bytes to bypass naive regex checks
  if (hasControlCharacters(trimmed)) {
    return false;
  }

  // 3. Reject HTML entity encoding in scheme portion (e.g. "javascript&colon;", "javascript&#58;")
  if (/^[a-zA-Z0-9+.-]+(?:&colon;|&#0*58;|&#x0*3a;)/i.test(trimmed)) {
    return false;
  }

  // 4. Check for dangerous schemes even with internal whitespace stripped
  const strippedScheme = trimmed.replace(/[\s\r\n\t]/g, '').toLowerCase();
  for (const scheme of DANGEROUS_SCHEMES) {
    if (strippedScheme.startsWith(scheme)) {
      return false;
    }
  }

  // 5. Check internal relative paths
  if (trimmed.startsWith('/')) {
    // Disallow if followed by another slash or backslash
    if (trimmed.length > 1 && (trimmed[1] === '/' || trimmed[1] === '\\')) {
      return false;
    }
    return true;
  }

  // 6. For absolute URLs, parse and strictly enforce http: or https:
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
