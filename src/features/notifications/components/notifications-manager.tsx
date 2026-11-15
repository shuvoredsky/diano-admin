'use client';

import { useState } from 'react';
import { Bell, CheckCheck, RefreshCw, AlertCircle, Filter, RotateCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { useAuthPermissions } from '@/features/auth/hooks';
import { PERMISSIONS } from '@/constants/permissions';
import {
  useMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useAdminNotificationLogsQuery,
  useRetryNotificationMutation,
} from '../hooks/use-notifications-queries';
import type { NotificationChannel, NotificationStatus } from '../types/notifications.types';

export function NotificationsManager() {
  const { hasPermission } = useAuthPermissions();
  const canManageLogs = hasPermission(PERMISSIONS.NOTIFICATION_MANAGE);

  const [activeTab, setActiveTab] = useState<'my' | 'logs'>('my');

  // My Notifications State
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const myPage = 1;
  const myLimit = 20;

  const { data: myData, isLoading: myLoading, refetch: refetchMy } = useMyNotificationsQuery({
    page: myPage,
    limit: myLimit,
  });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();

  // Admin Logs State
  const logPage = 1;
  const [logChannel, setLogChannel] = useState<string>('');
  const [logStatus, setLogStatus] = useState<string>('');
  const [logRecipient, setLogRecipient] = useState('');
  const [retryTargetId, setRetryTargetId] = useState<string | null>(null);

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useAdminNotificationLogsQuery({
    page: logPage,
    limit: 20,
    channel: (logChannel || undefined) as NotificationChannel | undefined,
    status: (logStatus || undefined) as NotificationStatus | undefined,
    recipient: logRecipient.trim() || undefined,
  });
  const retryMutation = useRetryNotificationMutation();

  const handleRetryConfirm = async () => {
    if (!retryTargetId) return;
    try {
      await retryMutation.mutateAsync(retryTargetId);
      setRetryTargetId(null);
    } catch {
      // Handled by UI
    }
  };

  const rawNotifications = myData?.notifications ?? [];
  const filteredNotifications = filterUnreadOnly
    ? rawNotifications.filter((n) => !n.isRead)
    : rawNotifications;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Notification Center"
          description="In-app alerts, operational communications, and system outbox delivery logs."
        />

        {/* Tab switch */}
        <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('my')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'my'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Notifications
            {myData && myData.unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
                {myData.unreadCount}
              </span>
            )}
          </button>

          {canManageLogs && (
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Delivery Outbox Logs
            </button>
          )}
        </div>
      </div>

      {activeTab === 'my' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterUnreadOnly}
                  onChange={(e) => setFilterUnreadOnly(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span>Unread alerts only</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchMy()}
                disabled={myLoading}
                className="h-8 gap-1.5 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${myLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>

              {myData && myData.unreadCount > 0 && (
                <Button
                  size="sm"
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending}
                  className="h-8 gap-1.5 text-xs"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark All as Read</span>
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
            {myLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading alerts...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                No {filterUnreadOnly ? 'unread ' : ''}notifications found.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start justify-between p-4 transition-colors ${
                      notif.isRead ? 'bg-card hover:bg-muted/20' : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-foreground">{notif.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{notif.message}</p>
                      <div className="pt-1 text-[11px] text-muted-foreground">
                        <DateText date={notif.createdAt} format="datetime" />
                      </div>
                    </div>

                    {!notif.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markReadMutation.mutate(notif.id)}
                        disabled={markReadMutation.isPending}
                        className="h-7 text-xs text-primary shrink-0"
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'logs' && canManageLogs && (
        <div className="space-y-4">
          {/* Logs Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search recipient (email / phone)..."
                value={logRecipient}
                onChange={(e) => setLogRecipient(e.target.value)}
                className="h-8 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <select
              aria-label="Filter by channel"
              value={logChannel}
              onChange={(e) => setLogChannel(e.target.value)}
              className="h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground"
            >
              <option value="">All Channels</option>
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
              <option value="IN_APP">In-App</option>
              <option value="PUSH">Push</option>
            </select>

            <select
              aria-label="Filter by delivery status"
              value={logStatus}
              onChange={(e) => setLogStatus(e.target.value)}
              className="h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="SENT">Sent</option>
              <option value="DELIVERED">Delivered</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchLogs()}
              disabled={logsLoading}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Logs Table */}
          <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Recipient</th>
                    <th className="px-4 py-3">Subject / Template</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Dispatched At</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logsLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Loading outbox logs...
                      </td>
                    </tr>
                  ) : logsData?.notifications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No delivery logs matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    logsData?.notifications.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">
                          <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-mono">
                            {log.channel}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-foreground">
                          {log.recipient}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="font-medium text-foreground line-clamp-1">{log.subject || log.template || '—'}</div>
                          {log.error && (
                            <div className="flex items-center gap-1 text-[11px] text-destructive mt-0.5 line-clamp-1">
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              <span>{log.error}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          <DateText date={log.sentAt || log.createdAt} format="datetime" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {log.status === 'FAILED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRetryTargetId(log.id)}
                              disabled={retryMutation.isPending}
                              className="h-7 text-xs gap-1"
                            >
                              <RotateCw className="h-3 w-3" />
                              <span>Retry</span>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Retry Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(retryTargetId)}
        onOpenChange={(open) => !open && setRetryTargetId(null)}
        title="Retry Notification Dispatch"
        description="Are you sure you want to requeue this failed notification for immediate redelivery?"
        confirmLabel="Queue Retry"
        variant="primary"
        isLoading={retryMutation.isPending}
        onConfirm={handleRetryConfirm}
      />
    </div>
  );
}
