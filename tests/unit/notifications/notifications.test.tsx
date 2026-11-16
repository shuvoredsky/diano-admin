import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AppProviders } from '@/components/providers/app-providers';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { NotificationsManager } from '@/features/notifications/components/notifications-manager';
import * as notificationsApi from '@/features/notifications/api/notifications.api';
import * as authPermissionsHook from '@/features/auth/hooks/use-auth-permissions';
import type {
  InAppNotification,
  AdminNotificationLog,
} from '@/features/notifications/types/notifications.types';

const mockNotifications: InAppNotification[] = [
  {
    id: 'notif-1',
    userId: 'admin-1',
    title: 'New High-Value Order #ORD-991',
    message: 'Customer placed order worth ৳ 45,000 for Silk Panjabi.',
    isRead: false,
    readAt: null,
    data: { orderId: 'ord-991', url: '/admin/orders' },
    createdAt: '2026-11-15T10:00:00.000Z',
  },
  {
    id: 'notif-2',
    userId: 'admin-1',
    title: 'Low Stock Alert <script>alert("xss")</script>',
    message: 'Panjabi Royal Silk Black (XL) stock is below threshold: 2 units remaining.',
    isRead: true,
    readAt: '2026-11-15T11:00:00.000Z',
    data: { productId: 'prod-1' },
    createdAt: '2026-11-15T09:00:00.000Z',
  },
];

const mockLogs: AdminNotificationLog[] = [
  {
    id: 'log-1',
    channel: 'EMAIL',
    status: 'SENT',
    recipient: 'customer@example.com',
    subject: 'Your DIANO Order #ORD-991 is Confirmed',
    sentAt: '2026-11-15T10:01:00.000Z',
    createdAt: '2026-11-15T10:00:30.000Z',
  },
  {
    id: 'log-2',
    channel: 'SMS',
    status: 'FAILED',
    recipient: '+8801711223344',
    subject: 'OTP Verification',
    error: 'SMS Gateway Timeout',
    sentAt: null,
    createdAt: '2026-11-15T10:05:00.000Z',
  },
];

function setupPermissions(permissions: string[], isSuperAdmin = false) {
  vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
    user: undefined,
    permissions,
    roles: isSuperAdmin ? ['super-admin'] : ['manager'],
    isSuperAdmin,
    isLoading: false,
    isAuthenticated: true,
    hasPermission: (perm) => permissions.includes(perm) || isSuperAdmin,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
  });
}

describe('Phase 9B: Notification Center & Delivery Logs', () => {
  let mockFetchMy: ReturnType<typeof vi.spyOn>;
  let mockMarkRead: ReturnType<typeof vi.spyOn>;
  let mockMarkAllRead: ReturnType<typeof vi.spyOn>;
  let mockFetchLogs: ReturnType<typeof vi.spyOn>;
  let mockRetryLog: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setupPermissions(['notification:manage', 'order:read'], true);

    mockFetchMy = vi.spyOn(notificationsApi, 'fetchMyNotifications').mockResolvedValue({
      notifications: mockNotifications,
      total: 2,
      unreadCount: 1,
      page: 1,
      limit: 20,
    });

    mockMarkRead = vi.spyOn(notificationsApi, 'markNotificationAsRead').mockResolvedValue({
      ...mockNotifications[0]!,
      isRead: true,
    });

    mockMarkAllRead = vi.spyOn(notificationsApi, 'markAllNotificationsAsRead').mockResolvedValue(1);

    mockFetchLogs = vi.spyOn(notificationsApi, 'fetchAdminNotificationLogs').mockResolvedValue({
      notifications: mockLogs,
      total: 2,
      page: 1,
      limit: 20,
    });

    mockRetryLog = vi.spyOn(notificationsApi, 'retryNotificationLog').mockResolvedValue({
      ...mockLogs[1]!,
      status: 'PENDING',
    });
  });

  describe('1. Notification Bell Popover & Badge', () => {
    it('renders unread badge when unread notifications exist', async () => {
      render(
        <AppProviders>
          <NotificationBell />
        </AppProviders>
      );

      const badge = await screen.findByTestId('unread-badge');
      expect(badge).toHaveTextContent('1');
      expect(mockFetchMy).toHaveBeenCalled();
    });

    it('opens dropdown and displays notifications with safe XSS text escaping', async () => {
      render(
        <AppProviders>
          <NotificationBell />
        </AppProviders>
      );

      const bellBtn = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellBtn);

      expect(await screen.findByText('New High-Value Order #ORD-991')).toBeInTheDocument();
      // Verifies script tag in title is rendered safely as text content, not executed
      expect(screen.getByText(/Low Stock Alert <script>alert\("xss"\)<\/script>/i)).toBeInTheDocument();
      expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined();
    });

    it('marks single notification as read when check button is clicked', async () => {
      render(
        <AppProviders>
          <NotificationBell />
        </AppProviders>
      );

      fireEvent.click(screen.getByRole('button', { name: /notifications/i }));

      const markReadBtn = await screen.findByTitle('Mark as read');
      fireEvent.click(markReadBtn);

      await waitFor(() => {
        expect(mockMarkRead).toHaveBeenCalledWith('notif-1');
      });
    });

    it('marks all notifications as read upon clicking Mark all read', async () => {
      render(
        <AppProviders>
          <NotificationBell />
        </AppProviders>
      );

      fireEvent.click(screen.getByRole('button', { name: /notifications/i }));

      const markAllBtn = await screen.findByRole('button', { name: /mark all read/i });
      fireEvent.click(markAllBtn);

      await waitFor(() => {
        expect(mockMarkAllRead).toHaveBeenCalled();
      });
    });
  });

  describe('2. Notifications Manager Page & Delivery Logs', () => {
    it('renders notification list with unread toggle filter', async () => {
      render(
        <AppProviders>
          <NotificationsManager />
        </AppProviders>
      );

      expect(await screen.findByText('New High-Value Order #ORD-991')).toBeInTheDocument();

      const checkbox = screen.getByLabelText(/unread alerts only/i);
      fireEvent.click(checkbox);

      // notif-2 is read, should be filtered out
      expect(screen.queryByText(/Low Stock Alert/i)).not.toBeInTheDocument();
      expect(screen.getByText('New High-Value Order #ORD-991')).toBeInTheDocument();
    });

    it('switches to Delivery Outbox Logs tab and renders delivery table', async () => {
      render(
        <AppProviders>
          <NotificationsManager />
        </AppProviders>
      );

      const logsTab = await screen.findByRole('button', { name: /delivery outbox logs/i });
      fireEvent.click(logsTab);

      expect(await screen.findByText('customer@example.com')).toBeInTheDocument();
      expect(screen.getByText('+8801711223344')).toBeInTheDocument();
      expect(screen.getByText('SMS Gateway Timeout')).toBeInTheDocument();
      expect(mockFetchLogs).toHaveBeenCalled();
    });

    it('triggers retry confirmation dialog and queues retry for failed logs', async () => {
      render(
        <AppProviders>
          <NotificationsManager />
        </AppProviders>
      );

      fireEvent.click(await screen.findByRole('button', { name: /delivery outbox logs/i }));

      const retryBtn = await screen.findByRole('button', { name: /retry/i });
      fireEvent.click(retryBtn);

      expect(await screen.findByText(/Retry Notification Dispatch/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /Queue Retry/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockRetryLog).toHaveBeenCalledWith('log-2');
      });
    });

    it('hides Delivery Outbox Logs tab when user lacks notification:manage', async () => {
      setupPermissions(['notification:read'], false);

      render(
        <AppProviders>
          <NotificationsManager />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /delivery outbox logs/i })).not.toBeInTheDocument();
    });
  });
});
