import { io, type Socket } from 'socket.io-client';
import { publicEnv } from '@/config/env';
import { onTokenRefreshed, onSessionExpired } from '@/lib/auth/auth-events';
import { executeTokenRefresh } from '@/lib/api/browser-client';

let activeSocket: Socket | null = null;
let currentToken: string | null = null;

type ConnectionStatusListener = (isConnected: boolean) => void;
const connectionListeners = new Set<ConnectionStatusListener>();

export function onSocketConnectionChange(listener: ConnectionStatusListener): () => void {
  connectionListeners.add(listener);
  listener(activeSocket?.connected ?? false);
  return () => {
    connectionListeners.delete(listener);
  };
}

function notifyConnectionChange(isConnected: boolean): void {
  for (const listener of connectionListeners) {
    try {
      listener(isConnected);
    } catch (err) {
      console.error('[SocketClient] Error in connection listener:', err);
    }
  }
}

/**
 * Initializes or returns the singleton Socket.IO client instance for the administrative portal.
 * Authenticated via JWT handshake token per FRONTEND_HANDOFF.md.
 */
export function initializeAdminSocket(token: string): Socket {
  if (activeSocket && currentToken === token) {
    return activeSocket;
  }

  // If socket exists with a different token, update auth and reconnect
  if (activeSocket) {
    currentToken = token;
    activeSocket.auth = { token };
    if (activeSocket.connected) {
      activeSocket.disconnect().connect();
    } else {
      activeSocket.connect();
    }
    return activeSocket;
  }

  currentToken = token;

  const socket = io(publicEnv.NEXT_PUBLIC_SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    notifyConnectionChange(true);
  });

  socket.on('disconnect', () => {
    notifyConnectionChange(false);
  });

  socket.on('connect_error', async (err: Error) => {
    notifyConnectionChange(false);
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('authentication') || msg.includes('token') || msg.includes('expired')) {
      try {
        const freshToken = await executeTokenRefresh();
        if (activeSocket && freshToken) {
          updateSocketToken(freshToken);
        }
      } catch {
        disconnectAdminSocket();
      }
    }
  });

  activeSocket = socket;
  return socket;
}

/**
 * Disconnects and destroys the active administrative Socket.IO connection.
 */
export function disconnectAdminSocket(): void {
  if (activeSocket) {
    activeSocket.removeAllListeners();
    activeSocket.disconnect();
    activeSocket = null;
    currentToken = null;
    notifyConnectionChange(false);
  }
}

/**
 * Updates the authentication token on the active socket after token rotation.
 */
export function updateSocketToken(newToken: string): void {
  currentToken = newToken;
  if (activeSocket) {
    activeSocket.auth = { token: newToken };
    if (activeSocket.connected) {
      activeSocket.disconnect().connect();
    } else {
      activeSocket.connect();
    }
  }
}

export function getAdminSocket(): Socket | null {
  return activeSocket;
}

// Wire automatic token refresh & session expiration listeners
if (typeof window !== 'undefined') {
  onTokenRefreshed((newToken) => {
    updateSocketToken(newToken);
  });

  onSessionExpired(() => {
    disconnectAdminSocket();
  });
}
