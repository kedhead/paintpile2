'use client';

import { NotificationList } from '../../../components/notifications/notification-list';

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
      <div className="rounded-lg border border-border bg-card py-2">
        <NotificationList />
      </div>
    </div>
  );
}
