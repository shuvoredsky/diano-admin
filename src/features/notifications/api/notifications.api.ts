import { api } from '@/lib/api/browser-client';
import type {
  InAppNotification,
  AdminNotificationLog,
  NotificationLogsQueryParams,
} from '../types/notifications.types';

export interface InAppNotificationsListResult {
  notifications: InAppNotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export interface AdminNotificationLogsResult {
  notifications: AdminNotificationLog[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchMyNotifications(params?: {
  page?: number;
  limit?: number;
}): Promise<InAppNotificationsListResult> {
  const queryParams: Record<string, number> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  const res = await api.get<{
    success: boolean;
    data: InAppNotification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      unreadCount: number;
      totalPages: number;
    };
  }>('/notifications', { params: queryParams });

  return {
    notifications: res.data.data ?? [],
    total: res.data.pagination?.total ?? 0,
    unreadCount: res.data.pagination?.unreadCount ?? 0,
    page: res.data.pagination?.page ?? 1,
    limit: res.data.pagination?.limit ?? 20,
  };
}

export async function markNotificationAsRead(id: string): Promise<InAppNotification> {
  const res = await api.patch<{
    success: boolean;
    data: InAppNotification;
  }>(`/notifications/${id}/read`);
  return res.data.data;
}

export async function markAllNotificationsAsRead(): Promise<number> {
  const res = await api.patch<{
    success: boolean;
    count: number;
  }>('/notifications/read-all');
  return res.data.count ?? 0;
}

export async function fetchAdminNotificationLogs(
  params?: NotificationLogsQueryParams
): Promise<AdminNotificationLogsResult> {
  const queryParams: Record<string, string | number> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.channel) queryParams.channel = params.channel;
  if (params?.status) queryParams.status = params.status;
  if (params?.template) queryParams.template = params.template;
  if (params?.recipient) queryParams.recipient = params.recipient;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;

  const res = await api.get<{
    success: boolean;
    data: AdminNotificationLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>('/admin/notifications', { params: queryParams });

  return {
    notifications: res.data.data ?? [],
    total: res.data.pagination?.total ?? 0,
    page: res.data.pagination?.page ?? 1,
    limit: res.data.pagination?.limit ?? 20,
  };
}

export async function retryNotificationLog(id: string): Promise<AdminNotificationLog> {
  const res = await api.post<{
    success: boolean;
    data: AdminNotificationLog;
  }>(`/admin/notifications/${id}/retry`);
  return res.data.data;
}
