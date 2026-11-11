'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getAdminSocket } from '@/lib/socket/socket-client';
import { useAuthPermissions } from '@/features/auth/hooks';

export function useDashboardRealtime() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthPermissions();
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(() => new Date());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const invalidateDashboard = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setLastRefreshedAt(new Date());
    }, 1500);
  }, [queryClient]);

  const manualRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['analytics'] }),
      queryClient.refetchQueries({ queryKey: ['orders'] }),
      queryClient.refetchQueries({ queryKey: ['inventory'] }),
    ]);
    setLastRefreshedAt(new Date());
  }, [queryClient]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getAdminSocket();
    if (!socket) return;

    const onOrderEvent = () => invalidateDashboard();
    const onStockEvent = () => invalidateDashboard();
    const onPaymentEvent = () => invalidateDashboard();

    socket.on('order:new', onOrderEvent);
    socket.on('order:status', onOrderEvent);
    socket.on('stock:low', onStockEvent);
    socket.on('payment:status', onPaymentEvent);

    return () => {
      socket.off('order:new', onOrderEvent);
      socket.off('order:status', onOrderEvent);
      socket.off('stock:low', onStockEvent);
      socket.off('payment:status', onPaymentEvent);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isAuthenticated, invalidateDashboard]);

  return {
    lastRefreshedAt,
    manualRefresh,
  };
}

