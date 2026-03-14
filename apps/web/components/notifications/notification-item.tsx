'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { Heart, MessageCircle, UserPlus, Award, ImagePlus, Newspaper, Bell } from 'lucide-react';
import { relativeTime } from '../../lib/pb-helpers';
import { useMarkNotificationRead } from '../../hooks/use-notifications';

const iconConfig: Record<string, { icon: typeof Heart; color: string }> = {
  like: { icon: Heart, color: 'text-red-400' },
  comment: { icon: MessageCircle, color: 'text-blue-400' },
  comment_reply: { icon: MessageCircle, color: 'text-blue-400' },
  follow: { icon: UserPlus, color: 'text-green-400' },
  badge_earned: { icon: Award, color: 'text-yellow-400' },
  new_post: { icon: ImagePlus, color: 'text-purple-400' },
  news: { icon: Newspaper, color: 'text-amber-400' },
  mention: { icon: MessageCircle, color: 'text-cyan-400' },
};

interface NotificationItemProps {
  notification: RecordModel;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const markRead = useMarkNotificationRead();
  const config = iconConfig[notification.type] || { icon: Bell, color: 'text-muted-foreground' };
  const Icon = config.icon;
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
      <div className={`mt-0.5 rounded-full p-1.5 ${isUnread ? 'bg-primary/20' : 'bg-muted'} ${config.color}`}>
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
