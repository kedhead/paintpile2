'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { Heart, MessageCircle, UserPlus } from 'lucide-react';
import { relativeTime } from '../../lib/pb-helpers';
import { useMarkNotificationRead } from '../../hooks/use-notifications';

const icons: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
};

interface NotificationItemProps {
  notification: RecordModel;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const markRead = useMarkNotificationRead();
  const Icon = icons[notification.type] || MessageCircle;
  const isUnread = !notification.read;

  const handleClick = () => {
    if (isUnread) {
      markRead.mutate(notification.id);
    }
  };

  const content = (
    <div
      className={`flex items-start gap-3 rounded-lg px-4 py-3 transition-colors ${
        isUnread ? 'bg-primary/10' : 'hover:bg-background'
      }`}
    >
      <div className={`mt-0.5 rounded-full p-1.5 ${isUnread ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{notification.message}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{relativeTime(notification.created)}</p>
      </div>
      {isUnread && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary/100" />}
    </div>
  );

  if (notification.action_url) {
    return (
      <Link href={notification.action_url} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return <div onClick={handleClick} className="cursor-pointer">{content}</div>;
}
