'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

const PAGE_SIZE = 20;

export type ActivityType =
  | 'project_created'
  | 'project_completed'
  | 'project_liked'
  | 'army_created'
  | 'army_liked'
  | 'recipe_created'
  | 'recipe_liked'
  | 'user_followed'
  | 'comment_created'
  | 'project_critique_shared'
  | 'user_joined';

export function useActivityFeed(type?: string) {
  const { pb } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.activities.feed(type),
    queryFn: async ({ pageParam = 1 }) => {
      let filter = 'visibility="public"';
      if (type && type !== 'all') {
        const typeMap: Record<string, string[]> = {
          projects: ['project_created', 'project_completed'],
          armies: ['army_created'],
          recipes: ['recipe_created'],
          likes: ['project_liked', 'army_liked', 'recipe_liked'],
          follows: ['user_followed'],
        };
        const types = typeMap[type];
        if (types) {
          filter += ` && (${types.map((t) => `type="${t}"`).join(' || ')})`;
        }
      }
      return pb.collection('activities').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        filter,
        expand: 'user',
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useCreateActivity() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: ActivityType;
      target_id: string;
      target_type: string;
      metadata?: Record<string, unknown>;
      visibility?: 'public' | 'private';
    }) => {
      return pb.collection('activities').create({
        user: user!.id,
        type: data.type,
        target_id: data.target_id,
        target_type: data.target_type,
        metadata: JSON.stringify(data.metadata || {}),
        visibility: data.visibility || 'public',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}

// Helper function for use in other hooks' onSuccess callbacks
export async function logActivity(
  pb: ReturnType<typeof useAuth>['pb'],
  userId: string,
  data: {
    type: ActivityType;
    target_id: string;
    target_type: string;
    metadata?: Record<string, unknown>;
    visibility?: 'public' | 'private';
  }
) {
  try {
    await pb.collection('activities').create({
      user: userId,
      type: data.type,
      target_id: data.target_id,
      target_type: data.target_type,
      metadata: JSON.stringify(data.metadata || {}),
      visibility: data.visibility || 'public',
    });
  } catch {
    // Activity logging failure shouldn't block the main action
    console.error('Failed to log activity');
  }
}
