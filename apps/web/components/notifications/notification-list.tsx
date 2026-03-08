'use client';

import { Loader2 } from 'lucide-react';
import { useNotifications, useMarkAllRead } from '../../hooks/use-notifications';
import { NotificationItem } from './notification-item';

export function NotificationList() {
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const notifications = data?.items || [];

  return (
    <div className="space-y-1">
      {notifications.length > 0 && (
        <div className="flex justify-end px-4 pb-2">
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-xs text-primary hover:underline"
          >
            Mark all as read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">No notifications yet</div>
      ) : (
        notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
      )}
    </div>
  );
}
