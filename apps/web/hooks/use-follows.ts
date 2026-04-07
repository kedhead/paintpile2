'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDisplayName } from '@paintpile/shared';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';
import { createNotification } from './use-notifications';
import { logActivity } from './use-activities';

export function useIsFollowing(targetUserId: string) {
  const { pb, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.follows.check(user?.id || '', targetUserId),
    queryFn: async () => {
      if (!user) return false;
      const result = await pb.collection('follows').getList(1, 1, {
        filter: `follower="${user.id}" && following="${targetUserId}"`,
      });
      return result.totalItems > 0;
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });
}

export function useToggleFollow() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async ({ targetUserId, isFollowing }: { targetUserId: string; isFollowing: boolean }) => {
      if (!user) return undefined;
      const key = queryKeys.follows.check(user.id, targetUserId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<boolean>(key);
      queryClient.setQueryData(key, !isFollowing);
      return { key, previous };
    },
    onError: (_err: unknown, _vars: unknown, context: { key: readonly string[]; previous: boolean | undefined } | undefined) => {
      if (context?.key) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    mutationFn: async ({
      targetUserId,
      isFollowing,
    }: {
      targetUserId: string;
      isFollowing: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');
      if (isFollowing) {
        const existing = await pb.collection('follows').getList(1, 1, {
          filter: `follower="${user.id}" && following="${targetUserId}"`,
        });
        if (existing.items[0]) {
          await pb.collection('follows').delete(existing.items[0].id);
        }
      } else {
        // Check for existing follow to prevent duplicates
        const existing = await pb.collection('follows').getList(1, 1, {
          filter: `follower="${user.id}" && following="${targetUserId}"`,
        });
        if (existing.items.length === 0) {
          await pb.collection('follows').create({
            follower: user.id,
            following: targetUserId,
          });
        }
      }
    },
    onSuccess: async (_data, { targetUserId, isFollowing }) => {
      if (!user) return;
      if (!isFollowing) {
        await createNotification(pb, {
          user: targetUserId,
          type: 'follow',
          actor_id: user.id,
          actor_name: getDisplayName(user, 'Someone'),
          target_id: user.id,
          target_type: 'user',
          message: `${getDisplayName(user, 'Someone')} started following you`,
          action_url: `/profile/${user.id}`,
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.follows.check(user.id, targetUserId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.followingIds(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.followers(targetUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.following(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats(targetUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.following() });
      // Log activity for new follows
      if (!isFollowing && user) {
        logActivity(pb, user.id, {
          type: 'user_followed',
          target_id: targetUserId,
          target_type: 'user',
        });
      }
    },
  });
}

export function useFollowingIds(userId: string) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.follows.followingIds(userId),
    queryFn: async () => {
      const result = await pb.collection('follows').getFullList({
        filter: `follower="${userId}"`,
        fields: 'following',
      });
      return result.map((r) => r.following as string);
    },
    enabled: !!userId,
  });
}

export function useFollowers(userId: string) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.follows.followers(userId),
    queryFn: async () => {
      const result = await pb.collection('follows').getFullList({
        filter: `following="${userId}"`,
        expand: 'follower',
      });
      return result;
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId: string) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.follows.following(userId),
    queryFn: async () => {
      const result = await pb.collection('follows').getFullList({
        filter: `follower="${userId}"`,
        expand: 'following',
      });
      return result;
    },
    enabled: !!userId,
  });
}
