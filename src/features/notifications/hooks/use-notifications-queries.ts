import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  fetchAdminNotificationLogs,
  retryNotificationLog,
} from '../api/notifications.api';
import { getAdminSocket } from '@/lib/socket/socket-client';
import type { NotificationLogsQueryParams } from '../types/notifications.types';

export const NOTIFICATIONS_QUERY_KEYS = {
  inApp: (page?: number, limit?: number) => ['notifications', 'in-app', page ?? 1, limit ?? 20] as const,
  inAppRoot: () => ['notifications', 'in-app'] as const,
  adminLogs: (params?: NotificationLogsQueryParams) => ['notifications', 'admin-logs', params ?? {}] as const,
  adminLogsRoot: () => ['notifications', 'admin-logs'] as const,
};

export function useMyNotificationsQuery(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEYS.inApp(params?.page, params?.limit),
    queryFn: () => fetchMyNotifications(params),
    staleTime: 30_000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.inAppRoot() });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.inAppRoot() });
    },
  });
}

export function useAdminNotificationLogsQuery(params?: NotificationLogsQueryParams) {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEYS.adminLogs(params),
    queryFn: () => fetchAdminNotificationLogs(params),
    staleTime: 30_000,
  });
}

export function useRetryNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => retryNotificationLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.adminLogsRoot() });
    },
  });
}

/**
 * Subscribes to real-time 'notification:new' socket events and invalidates
 * notification queries with a small debounce.
 */
export function useNotificationSocketSync() {
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socket = getAdminSocket();
    if (!socket) return;

    const handleNewNotification = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }, 250);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [queryClient]);
}
