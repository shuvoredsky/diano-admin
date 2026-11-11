import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { io } from 'socket.io-client';
import {
  initializeAdminSocket,
  disconnectAdminSocket,
  updateSocketToken,
  getAdminSocket,
} from '@/lib/socket/socket-client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSocket: any = {
  connected: false,
  auth: {},
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn().mockImplementation(() => {
    mockSocket.connected = true;
  }),
  disconnect: vi.fn().mockImplementation(() => {
    mockSocket.connected = false;
    return mockSocket;
  }),
  removeAllListeners: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

describe('Admin Socket.IO Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
    mockSocket.auth = {};
    disconnectAdminSocket();
  });

  afterEach(() => {
    disconnectAdminSocket();
  });

  it('initializes socket with JWT handshake auth shape', () => {
    const socket = initializeAdminSocket('admin-jwt-token-123');

    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        auth: { token: 'admin-jwt-token-123' },
        transports: ['websocket', 'polling'],
        reconnection: true,
      })
    );
    expect(socket).toBe(mockSocket);
  });

  it('preserves single socket instance in React strict mode with same token', () => {
    const socket1 = initializeAdminSocket('token-abc');
    const socket2 = initializeAdminSocket('token-abc');

    expect(io).toHaveBeenCalledTimes(1);
    expect(socket1).toBe(socket2);
  });

  it('updates token and reconnects when access token rotates', () => {
    initializeAdminSocket('old-token');
    mockSocket.connected = true;

    updateSocketToken('rotated-new-token');

    expect(mockSocket.auth).toEqual({ token: 'rotated-new-token' });
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(mockSocket.connect).toHaveBeenCalled();
  });

  it('disconnects and clears socket on logout/session loss', () => {
    initializeAdminSocket('token-to-destroy');
    expect(getAdminSocket()).not.toBeNull();

    disconnectAdminSocket();

    expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(getAdminSocket()).toBeNull();
  });
});
