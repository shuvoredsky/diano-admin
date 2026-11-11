type SessionExpiredHandler = (returnTo?: string) => void;
type TokenRefreshedHandler = (newToken: string) => void;

const sessionExpiredHandlers = new Set<SessionExpiredHandler>();
const tokenRefreshedHandlers = new Set<TokenRefreshedHandler>();

export function onSessionExpired(handler: SessionExpiredHandler): () => void {
  sessionExpiredHandlers.add(handler);
  return () => {
    sessionExpiredHandlers.delete(handler);
  };
}

export function emitSessionExpired(returnTo?: string): void {
  for (const handler of sessionExpiredHandlers) {
    try {
      handler(returnTo);
    } catch (err) {
      console.error('[AuthEvents] Error in sessionExpired handler:', err);
    }
  }
}

export function onTokenRefreshed(handler: TokenRefreshedHandler): () => void {
  tokenRefreshedHandlers.add(handler);
  return () => {
    tokenRefreshedHandlers.delete(handler);
  };
}

export function emitTokenRefreshed(newToken: string): void {
  for (const handler of tokenRefreshedHandlers) {
    try {
      handler(newToken);
    } catch (err) {
      console.error('[AuthEvents] Error in tokenRefreshed handler:', err);
    }
  }
}
