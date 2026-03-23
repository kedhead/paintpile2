'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';

export function useActiveAds(placement: 'feed' | 'sidebar') {
  const { pb } = useAuth();

  return useQuery({
    queryKey: ['ads', placement],
    queryFn: async () => {
      const now = new Date().toISOString();
      try {
        const ads = await pb.collection('ads').getFullList({
          filter: `is_active = true && placement = "${placement}" && start_date <= "${now}" && end_date >= "${now}"`,
          sort: '-priority',
        });
        // Shuffle for variety
        for (let i = ads.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [ads[i], ads[j]] = [ads[j]!, ads[i]!];
        }
        return ads;
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
