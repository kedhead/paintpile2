'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

const PAGE_SIZE = 20;

export function useDiscoverFeed() {
  const { pb } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.posts.discover(),
    queryFn: async ({ pageParam = 1 }) => {
      return pb.collection('posts').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        filter: 'is_public = true',
        expand: 'user',
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useFollowingFeed(followingIds: string[]) {
  const { pb } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.posts.following(),
    queryFn: async ({ pageParam = 1 }) => {
      if (followingIds.length === 0) {
        return { items: [], page: 1, perPage: PAGE_SIZE, totalItems: 0, totalPages: 0 };
      }
      const filter = followingIds.map((id) => `user="${id}"`).join(' || ');
      return pb.collection('posts').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        filter,
        expand: 'user',
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: followingIds.length > 0,
  });
}

export function useUserPosts(userId: string) {
  const { pb } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.posts.byUser(userId),
    queryFn: async ({ pageParam = 1 }) => {
      return pb.collection('posts').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        filter: `user="${userId}"`,
        expand: 'user',
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useCreatePost() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return pb.collection('posts').create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
