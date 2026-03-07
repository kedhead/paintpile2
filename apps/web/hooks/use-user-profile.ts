'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useUserProfile(userId: string) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: async () => {
      return pb.collection('users').getOne(userId);
    },
    enabled: !!userId,
  });
}

export function useUserStats(userId: string) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.users.stats(userId),
    queryFn: async () => {
      const [posts, followers, following] = await Promise.all([
        pb.collection('posts').getList(1, 1, { filter: `user="${userId}"`, fields: 'id' }),
        pb.collection('follows').getList(1, 1, { filter: `following="${userId}"`, fields: 'id' }),
        pb.collection('follows').getList(1, 1, { filter: `follower="${userId}"`, fields: 'id' }),
      ]);
      return {
        postCount: posts.totalItems,
        followerCount: followers.totalItems,
        followingCount: following.totalItems,
      };
    },
    enabled: !!userId,
  });
}
