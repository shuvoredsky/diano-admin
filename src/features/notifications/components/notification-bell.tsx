'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, ExternalLink, Clock } from 'lucide-react';
import {
  useMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useNotificationSocketSync,
} from '../hooks/use-notifications-queries';
import { DateText } from '@/components/shared/date-text';
import { isSafeUrl } from '@/lib/validations/link-safety';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time socket updates
  useNotificationSocketSync();

  const { data, isLoading } = useMyNotificationsQuery({ page: 1, limit: 10 });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await markAllMutation.mutateAsync();
    } catch {
      // Ignored
    }
  };

  const handleMarkItemRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markReadMutation.mutateAsync(id);
    } catch {
      // Ignored
    }
  };

  const getTargetUrl = (notifData?: Record<string, unknown> | null): string | null => {
    if (!notifData) return null;
    if (typeof notifData.url === 'string' && isSafeUrl(notifData.url)) {
      return notifData.url;
    }
    if (typeof notifData.orderId === 'string' && notifData.orderId) {
      return `/admin/orders`;
    }
    if (typeof notifData.productId === 'string' && notifData.productId) {
      return `/admin/products`;
    }
    return null;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-mint/40 hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span
            data-testid="unread-badge"
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="region"
          aria-label="Notifications panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markAllMutation.isPending}
                className="text-[11px] font-medium text-primary hover:underline disabled:opacity-50 cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Bell className="mx-auto h-6 w-6 text-muted-foreground/40 mb-2" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => {
                const targetUrl = getTargetUrl(notif.data);

                return (
                  <div
                    key={notif.id}
                    className={`flex flex-col gap-1 p-3.5 transition-colors ${
                      notif.isRead ? 'bg-background hover:bg-muted/30' : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {!notif.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                        <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                          {notif.title}
                        </h4>
                      </div>

                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkItemRead(notif.id, e)}
                          disabled={markReadMutation.isPending}
                          title="Mark as read"
                          className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-1 pt-1 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        <DateText date={notif.createdAt} format="datetime" />
                      </span>

                      {targetUrl && (
                        <Link
                          href={targetUrl}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-0.5 text-primary hover:underline font-medium"
                        >
                          <span>View</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-2 bg-muted/20 text-center">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-primary hover:underline block py-1"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
