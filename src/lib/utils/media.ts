import { publicEnv } from '@/config/env';

/**
 * Resolves any media URL (Cloudinary absolute URL, local backend /uploads/* path,
 * or blob/data preview URL) into a fully qualified browser-accessible URL.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';

  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Prepend backend origin for relative local upload paths (e.g. /uploads/...)
  const backendBase = publicEnv.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
  const cleanBase = backendBase.replace(/\/$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `${cleanBase}${cleanPath}`;
}

