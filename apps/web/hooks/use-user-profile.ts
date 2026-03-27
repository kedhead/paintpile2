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
  const { pb, user: authUser } = useAuth();

  return useQuery({
    // Include the requesting user's id so the query re-runs (and gets the
    // correct auth context) whenever the logged-in user changes.
    // invalidateQueries(['users','stats', userId]) still matches by prefix.
    queryKey: [...queryKeys.users.stats(userId), authUser?.id ?? 'anon'],
    queryFn: async () => {
      const [postsResult, followersResult, followingResult] = await Promise.allSettled([
        pb.collection('posts').getList(1, 1, { filter: `user="${userId}"`, fields: 'id' }),
        pb.collection('follows').getList(1, 1, { filter: `following="${userId}"`, fields: 'id' }),
        pb.collection('follows').getList(1, 1, { filter: `follower="${userId}"`, fields: 'id' }),
      ]);
      return {
        postCount: postsResult.status === 'fulfilled' ? postsResult.value.totalItems : 0,
        followerCount: followersResult.status === 'fulfilled' ? followersResult.value.totalItems : 0,
        followingCount: followingResult.status === 'fulfilled' ? followingResult.value.totalItems : 0,
      };
    },
    enabled: !!userId,
    staleTime: 0, // always re-validate on profile visit
  });
}
