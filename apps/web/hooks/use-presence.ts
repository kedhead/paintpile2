'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function usePresence() {
  const { pb, user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const updatePresence = async () => {
      try {
        await pb.collection('users').update(user.id, {
          last_active_at: new Date().toISOString(),
        });
      } catch {
        // Presence update failure is non-critical
      }
    };

    // Update on mount
    updatePresence();

    // Update every 2 minutes
    const interval = setInterval(updatePresence, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [pb, user]);
}

export function useIsUserOnline(userId: string) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.users.profile(userId), 'online'],
    queryFn: async () => {
      const user = await pb.collection('users').getOne(userId, { fields: 'last_active_at' });
      if (!user.last_active_at) return false;
      return Date.now() - new Date(user.last_active_at).getTime() < 5 * 60 * 1000;
    },
    enabled: !!userId,
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useBatchOnlineStatus(userIds: string[]) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: ['online-status', ...userIds.sort()],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const filter = userIds.map((id) => `id="${id}"`).join(' || ');
      const users = await pb.collection('users').getFullList({
        filter: `(${filter}) && last_active_at>="${fiveMinAgo}"`,
        fields: 'id',
      });
      const onlineMap: Record<string, boolean> = {};
      for (const id of userIds) onlineMap[id] = false;
      for (const u of users) onlineMap[u.id] = true;
      return onlineMap;
    },
    enabled: userIds.length > 0,
    refetchInterval: 2 * 60 * 1000,
  });
}
