'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

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

  return useMutation({
    mutationFn: async () => {
      const { checkAndAwardBadges } = await import('../lib/badge-checker');
      await checkAndAwardBadges(pb, user!.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.badges.user(user!.id) });
    },
  });
}
