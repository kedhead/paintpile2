'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useNotifications() {
  const { pb, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: async () => {
      return pb.collection('notifications').getList(1, 50, {
        filter: `user="${user!.id}"`,
        sort: '-created',
      });
    },
    enabled: !!user,
  });
}

export function useUnreadCount() {
  const { pb, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const result = await pb.collection('notifications').getList(1, 1, {
        filter: `user="${user!.id}" && read=false`,
        fields: 'id',
      });
      return result.totalItems;
    },
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30s as fallback
  });
}

export function useMarkNotificationRead() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return pb.collection('notifications').update(notificationId, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllRead() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const unread = await pb.collection('notifications').getFullList({
        filter: `user="${user!.id}" && read=false`,
        fields: 'id',
      });
      await Promise.all(
        unread.map((n) => pb.collection('notifications').update(n.id, { read: true }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useRealtimeNotifications() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | undefined;

    pb.collection('notifications').subscribe('*', (e) => {
      if (e.record.user === user.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      }
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      unsubscribe?.();
    };
  }, [pb, user, queryClient]);
}

export async function createNotification(
  pb: ReturnType<typeof useAuth>['pb'],
  data: {
    user: string;
    type: string;
    actor_id: string;
    actor_name: string;
    target_id: string;
    target_type: string;
    message: string;
    action_url?: string;
    target_name?: string;
    comment?: string;
  }
) {
  // Don't notify yourself
  if (data.user === data.actor_id) return;

  try {
    await pb.collection('notifications').create({
      ...data,
      read: false,
    });

    // Trigger multi-channel delivery (email + push)
    fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: data.user,
        type: data.type,
        actorName: data.actor_name,
        message: data.message,
        actionUrl: data.action_url,
        targetName: data.target_name,
        comment: data.comment,
      }),
    }).catch(() => {
      // Non-blocking
    });
  } catch {
    // Notification creation failure shouldn't block the main action
    console.error('Failed to create notification');
  }
}
