import DOMPurify from 'isomorphic-dompurify';

/**
 * Strict HTML Sanitizer powered by DOMPurify
 *
 * Rules & Allowlist:
 * - Allowed Tags: p, br, strong, em, b, i, u, s, strike, h1-h6, ul, ol, li, blockquote, code, pre, hr, a, img, table, thead, tbody, tr, th, td, span, div.
 * - Forbid Tags: script, style, iframe, object, embed, form, input, button, textarea, select, applet, meta, link, base, svg, math.
 * - Forbid Attributes: all inline event handlers (on*), style attribute.
 * - Allowed Protocols: http, https, mailto, tel, or internal relative paths (/ not followed by / or \).
 * - Safety Hook: automatically sets rel="noopener noreferrer" whenever target="_blank" is used on <a> tags.
 */

export const SANITIZER_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  'strike',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'hr',
  'a',
  'img',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'span',
  'div',
];

export const SANITIZER_ALLOWED_ATTR = [
  'href',
  'src',
  'alt',
  'title',
  'class',
  'target',
  'rel',
  'width',
  'height',
  'align',
];

// Allows safe URL protocols or relative paths; also permits standard target keywords (_blank, _self, etc.)
export const SAFE_URI_REGEXP =
  /^(?:(?:https?|mailto|tel):|\/(?!\/|\\)|[#?]|_blank|_self|_parent|_top)/i;

// Register security hook on DOMPurify
if (typeof DOMPurify?.addHook === 'function') {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName?.toLowerCase() === 'a') {
      const target = node.getAttribute('target');
      if (target === '_blank') {
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });
}

export function sanitizeHtml(rawHtml?: string | null): string {
  if (!rawHtml) return '';

  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: SANITIZER_ALLOWED_TAGS,
    ALLOWED_ATTR: SANITIZER_ALLOWED_ATTR,
    ADD_ATTR: ['target', 'rel'],
    ALLOWED_URI_REGEXP: SAFE_URI_REGEXP,
    FORBID_TAGS: [
      'script',
      'style',
      'iframe',
      'object',
      'embed',
      'form',
      'input',
      'button',
      'textarea',
      'select',
      'applet',
      'meta',
      'link',
      'base',
      'svg',
      'math',
    ],
    FORBID_ATTR: ['style'],
  });
}
