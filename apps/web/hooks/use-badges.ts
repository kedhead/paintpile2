'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';
import type { NewlyEarnedBadge } from '../lib/badge-checker';

export function useAllBadges() {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.badges.list(),
    queryFn: async () => {
      return pb.collection('badges').getFullList({ sort: 'category,tier' });
    },
  });
}

export function useUserBadges(userId: string) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.badges.user(userId),
    queryFn: async () => {
      return pb.collection('user_badges').getFullList({
        filter: `user="${userId}"`,
        expand: 'badge',
        sort: '-earned_at',
      });
    },
    enabled: !!userId,
  });
}

export function useCheckBadges() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();
  const [newBadges, setNewBadges] = useState<NewlyEarnedBadge[]>([]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { checkAndAwardBadges } = await import('../lib/badge-checker');
      return checkAndAwardBadges(pb, user!.id);
    },
    onSuccess: (earned) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.badges.user(user!.id) });
      if (earned.length > 0) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        setNewBadges(earned);
      }
    },
  });

  const dismissBadges = useCallback(() => setNewBadges([]), []);

  return {
    ...mutation,
    newBadges,
    dismissBadges,
  };
}
