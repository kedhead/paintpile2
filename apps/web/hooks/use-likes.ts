'use client';

import { useQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import type { ListResult, RecordModel } from 'pocketbase';
import { getDisplayName } from '@paintpile/shared';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';
import { createNotification } from './use-notifications';
import { logActivity } from './use-activities';

export function useHasLiked(targetId: string) {
  const { pb, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.likes.check(targetId, user?.id || ''),
    queryFn: async () => {
      if (!user) return false;
      const result = await pb.collection('likes').getList(1, 1, {
        filter: `user="${user.id}" && target_id="${targetId}"`,
      });
      return result.totalItems > 0;
    },
    enabled: !!user,
  });
}

export function useToggleLike() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetId,
      targetType,
      liked,
    }: {
      targetId: string;
      targetType: string;
      liked: boolean;
    }) => {
      if (liked) {
        // Unlike: find and delete
        const existing = await pb.collection('likes').getList(1, 1, {
          filter: `user="${user!.id}" && target_id="${targetId}"`,
        });
        if (existing.items[0]) {
          await pb.collection('likes').delete(existing.items[0].id);
        }
      } else {
        // Like: create
        await pb.collection('likes').create({
          user: user!.id,
          target_id: targetId,
          target_type: targetType,
        });
      }
    },
    onMutate: async ({ targetId, liked }) => {
      // Optimistic update on post like counts in feed caches
      const delta = liked ? -1 : 1;
      const feedKeys = [queryKeys.posts.discover(), queryKeys.posts.following()];

      for (const key of feedKeys) {
        await queryClient.cancelQueries({ queryKey: key });
        queryClient.setQueryData<InfiniteData<ListResult<RecordModel>>>(key, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((post) =>
                post.id === targetId
                  ? { ...post, like_count: Math.max(0, (post.like_count || 0) + delta) }
                  : post
              ),
            })),
          };
        });
      }
    },
    onSuccess: async (_data, { targetId, targetType, liked }) => {
      if (!liked && targetType === 'post') {
        // Find post owner to notify
        try {
          const post = await pb.collection('posts').getOne(targetId, { fields: 'user' });
          await createNotification(pb, {
            user: post.user,
            type: 'like',
            actor_id: user!.id,
            actor_name: getDisplayName(user!, 'Someone'),
            target_id: targetId,
            target_type: 'post',
            message: `${getDisplayName(user!, 'Someone')} liked your post`,
            action_url: `/feed`,
          });
        } catch {}
      }
    },
    onSettled: (_data, _err, { targetId, targetType, liked }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.likes.check(targetId, user!.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      // Log activity for new likes
      if (!liked && user) {
        const activityType = targetType === 'army' ? 'army_liked' : targetType === 'recipe' ? 'recipe_liked' : 'project_liked';
        logActivity(pb, user.id, {
          type: activityType as 'project_liked' | 'army_liked' | 'recipe_liked',
          target_id: targetId,
          target_type: targetType,
        });
      }
    },
  });
}
