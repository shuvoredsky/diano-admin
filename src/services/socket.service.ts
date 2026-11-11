import { io, type Socket } from 'socket.io-client';
import { publicEnv } from '@/config/env';
import { getAccessToken } from '@/lib/auth/token-store';

/**
 * Server-to-Client Event Payloads aligned with diano-server/src/sockets/socket.server.ts
 */
export interface OrderNewSocketEvent {
  id: string;
  type: 'order:new';
  orderNumber: string;
  totalAmount: string;
  summary: string;
  timestamp: string;
}

export interface OrderStatusSocketEvent {
  id: string;
  type: 'order:status';
  orderNumber: string;
  status: string;
  summary: string;
  timestamp: string;
}

export interface PaymentStatusSocketEvent {
  id: string;
  type: 'payment:status';
  paymentId: string;
  status: string;
  summary: string;
  timestamp: string;
}

export interface StockLowSocketEvent {
  id: string;
  type: 'stock:low';
  variantId: string;
  available: number;
  threshold: number;
  summary: string;
  timestamp: string;
}

export interface CheckoutAbandonedSocketEvent {
  id: string;
  type: 'checkout:abandoned';
  sessionId: string;
  summary: string;
  timestamp: string;
}

export interface FraudReviewSocketEvent {
  id: string;
  type: 'fraud:review';
  orderId: string;
  score: number;
  riskTier: string;
  summary: string;
  timestamp: string;
}

export interface NotificationNewSocketEvent {
  id: string;
  type: 'notification:new';
  notificationId: string;
  summary: string;
  template: string;
  timestamp: string;
}

export interface ServerToClientEvents {
  'order:new': (payload: OrderNewSocketEvent) => void;
  'order:status': (payload: OrderStatusSocketEvent) => void;
  'payment:status': (payload: PaymentStatusSocketEvent) => void;
  'stock:low': (payload: StockLowSocketEvent) => void;
  'checkout:abandoned': (payload: CheckoutAbandonedSocketEvent) => void;
  'fraud:review': (payload: FraudReviewSocketEvent) => void;
  'notification:new': (payload: NotificationNewSocketEvent) => void;
  error: (payload: { message: string }) => void;
}

/**
 * Note: Client-initiated room joins (`join`, `subscribe`, `room:*`) are strictly
 * forbidden by diano-server (`src/sockets/socket.server.ts` lines 156-159).
 * Server assigns `admin:all` and `admin:perm:<slug>` rooms automatically during JWT handshake.
 */
export type ClientToServerEvents = Record<string, never>;

export type AdminSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: AdminSocket | null = null;

export function connectAdminSocket(explicitToken?: string): AdminSocket | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = explicitToken ?? getAccessToken();
  if (!token) {
    return null;
  }

  if (socketInstance?.connected) {
    return socketInstance;
  }

  socketInstance = io(publicEnv.NEXT_PUBLIC_SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    transports: ['websocket', 'polling'],
  });

  return socketInstance;
}

export function getAdminSocket(): AdminSocket | null {
  return socketInstance;
}

export function disconnectAdminSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

