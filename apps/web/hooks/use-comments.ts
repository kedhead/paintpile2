'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDisplayName } from '@paintpile/shared';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';
import { createNotification } from './use-notifications';

export function useComments(targetId: string, enabled = true) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.comments.byTarget(targetId),
    queryFn: async () => {
      return pb.collection('comments').getList(1, 50, {
        filter: `target_id="${targetId}"`,
        sort: 'created',
        expand: 'user',
      });
    },
    enabled,
  });
}

export function useCreateComment() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetId,
      targetType,
      content,
    }: {
      targetId: string;
      targetType: string;
      content: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      return pb.collection('comments').create({
        user: user.id,
        target_id: targetId,
        target_type: targetType,
        content,
      });
    },
    onSuccess: async (_data, { targetId, targetType }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTarget(targetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });

      if (targetType === 'post') {
        try {
          const post = await pb.collection('posts').getOne(targetId, { fields: 'user' });
          await createNotification(pb, {
            user: post.user,
            type: 'comment',
            actor_id: user?.id || '',
            actor_name: getDisplayName(user!, 'Someone'),
            target_id: targetId,
            target_type: 'post',
            message: `${getDisplayName(user!, 'Someone')} commented on your post`,
            action_url: `/feed`,
          });
        } catch {}
      }
    },
  });
}

export function useEditComment() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      return pb.collection('comments').update(commentId, { content, edited: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
    },
  });
}

export function useDeleteComment() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      return pb.collection('comments').delete(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
