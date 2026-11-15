export type NotificationChannel = 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  readAt?: string | null;
  data?: Record<string, unknown> | null;
  createdAt: string;
}

export interface InAppNotificationsResponse {
  notifications: InAppNotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export interface AdminNotificationLog {
  id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  template?: string | null;
  recipient: string;
  subject?: string | null;
  content?: string | null;
  error?: string | null;
  attempts?: number;
  sentAt?: string | null;
  createdAt: string;
}

export interface NotificationLogsQueryParams {
  page?: number;
  limit?: number;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  template?: string;
  recipient?: string;
  startDate?: string;
  endDate?: string;
}
