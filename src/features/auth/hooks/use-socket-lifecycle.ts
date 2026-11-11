'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { getAccessToken } from '@/lib/auth/token-store';
import {
  initializeAdminSocket,
  disconnectAdminSocket,
  onSocketConnectionChange,
} from '@/lib/socket/socket-client';

export interface UseSocketLifecycleResult {
  isConnected: boolean;
  hasUnreadNotification: boolean;
  clearNotificationIndicator: () => void;
}

export function useSocketLifecycle(): UseSocketLifecycleResult {
  const { isAuthenticated } = usePermissions();
  const [isConnected, setIsConnected] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);

  useEffect(() => {
    // Listen to connection state changes
    const unsubscribe = onSocketConnectionChange((connected) => {
      setIsConnected(connected);
    });

    if (!isAuthenticated) {
      disconnectAdminSocket();
      return unsubscribe;
    }

    const token = getAccessToken();
    if (token) {
      const socket = initializeAdminSocket(token);

      // Listen to backend notification event
      const handleNewNotification = () => {
        setHasUnreadNotification(true);
      };

      socket.on('notification:new', handleNewNotification);

      return () => {
        socket.off('notification:new', handleNewNotification);
        unsubscribe();
      };
    }

    return unsubscribe;
  }, [isAuthenticated]);

  const clearNotificationIndicator = () => {
    setHasUnreadNotification(false);
  };

  return {
    isConnected,
    hasUnreadNotification,
    clearNotificationIndicator,
  };
}
