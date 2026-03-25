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
        await pb.collection('follows').create({
          follower: user.id,
          following: targetUserId,
        });
      }
    },
    // Optimistically flip the button immediately on click
    onMutate: async ({ targetUserId, isFollowing }) => {
      if (!user) return;
      const checkKey = queryKeys.follows.check(user.id, targetUserId);
      await queryClient.cancelQueries({ queryKey: checkKey });
      const previousValue = queryClient.getQueryData<boolean>(checkKey);
      queryClient.setQueryData<boolean>(checkKey, !isFollowing);
      return { previousValue };
    },
    // Revert optimistic update if the server call fails
    onError: (_err, { targetUserId }, context) => {
      if (!user || !context) return;
      queryClient.setQueryData(
        queryKeys.follows.check(user.id, targetUserId),
        (context as { previousValue: boolean | undefined }).previousValue,
      );
    },
    onSuccess: (_data, { targetUserId, isFollowing }) => {
      if (!user) return;
      // Fire notification + activity in the background — don't block cache invalidation
      if (!isFollowing) {
        createNotification(pb, {
          user: targetUserId,
          type: 'follow',
          actor_id: user.id,
          actor_name: getDisplayName(user, 'Someone'),
          target_id: user.id,
          target_type: 'user',
          message: `${getDisplayName(user, 'Someone')} started following you`,
          action_url: `/profile/${user.id}`,
        }).catch(() => {});
        logActivity(pb, user.id, {
          type: 'user_followed',
          target_id: targetUserId,
          target_type: 'user',
        });
      }
    },
    // Always confirm from server after mutation settles (success or error)
    onSettled: (_data, _err, { targetUserId }) => {
      if (!user) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.check(user.id, targetUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.followingIds(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.followers(targetUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.following(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats(targetUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.following() });
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
