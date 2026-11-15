/**
 * HTML Sanitizer for Rich Text & User Content
 * Defense-in-depth sanitization:
 * - Strips <script> and dangerous executable tags (<script>, <iframe>, <object>, <embed>, <applet>)
 * - Strips inline event handlers (onload, onerror, onclick, onmouseover, etc.)
 * - Strips javascript: and data: pseudo-protocol URIs
 */

export function sanitizeHtml(rawHtml?: string | null): string {
  if (!rawHtml) return '';

  let sanitized = rawHtml;

  // 1. Strip script tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Strip dangerous executable containers (iframe, object, embed, applet, meta, link, base)
  sanitized = sanitized.replace(/<\/?(?:iframe|object|embed|applet|meta|link|base)\b[^>]*>/gi, '');

  // 3. Strip inline event handlers (e.g. onerror=..., onclick=..., onload=...)
  sanitized = sanitized.replace(/\s+on[a-z0-9_-]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 4. Strip dangerous pseudo-protocols in attributes (href="javascript:...", src="javascript:...", data:...)
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '$1="#"');
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*(?:'data:text\/html[^']*'|"data:text\/html[^"]*"|data:text\/html[^\s>]+)/gi, '$1="#"');
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*(?:'vbscript:[^']*'|"vbscript:[^"]*"|vbscript:[^\s>]+)/gi, '$1="#"');

  return sanitized;
}
