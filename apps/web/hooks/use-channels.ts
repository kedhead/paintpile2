'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useChannels() {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.channels.list(),
    queryFn: async () => {
      return pb.collection('channels').getFullList({
        sort: 'sort_order',
      });
    },
  });
}
