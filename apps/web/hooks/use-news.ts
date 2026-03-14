'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';
import { notifyAllUsersOfNews } from '../lib/notify-helpers';

const PAGE_SIZE = 20;

export function useNews() {
  const { pb } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.news.list(),
    queryFn: async ({ pageParam = 1 }) => {
      return pb.collection('news').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        expand: 'author',
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useCreateNews() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      type: 'update' | 'feature' | 'announcement' | 'maintenance';
    }) => {
      const record = await pb.collection('news').create({
        ...data,
        author: user!.id,
      });

      // Notify all users about the new news post
      notifyAllUsersOfNews(
        pb,
        record.id,
        data.title,
        data.type,
        user!.id,
        user!.username || user!.name || 'PaintPile',
      );

      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
    },
  });
}
