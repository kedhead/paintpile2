'use client';

import { NotificationList } from '../../../components/notifications/notification-list';

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      <div className="rounded-lg border border-gray-200 bg-white py-2">
        <NotificationList />
      </div>
    </div>
  );
}
