/**
 * Short-lived in-memory access token holder for browser API requests.
 *
 * Security Architecture:
 * - Long-lived refresh tokens (`diano_refresh_token`) are NEVER stored in localStorage,
 *   sessionStorage, or accessible JavaScript memory; they remain strictly in HttpOnly cookies.
 * - Short-lived JWT access tokens (15m TTL) are held only in volatile JS memory and rotated
 *   silently via `/api/v1/auth/refresh` (or the same-origin BFF `/api/auth/refresh` route).
 */

let inMemoryAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function clearAccessToken(): void {
  inMemoryAccessToken = null;
}

