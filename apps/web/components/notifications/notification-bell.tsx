'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useUnreadCount, useRealtimeNotifications } from '../../hooks/use-notifications';

export function NotificationBell() {
  useRealtimeNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <Link
      href="/notifications"
      className="relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
