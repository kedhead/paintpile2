'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';

export function useLiveStreams() {
  const { pb } = useAuth();

  return useQuery({
    queryKey: ['live-streams'],
    queryFn: async () => {
      return pb.collection('live_streams').getFullList({
        filter: 'is_live = true',
        sort: '-created',
        expand: 'user',
      });
    },
    refetchInterval: 10000, // Poll every 10 seconds for live status
  });
}

export function useStartStream() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title }: { title: string }) => {
      const user = pb.authStore.record;
      if (!user) throw new Error('Not authenticated');

      const roomName = `feed_live_${user.id}`;

      // Check if there's already an active stream
      const existing = await pb.collection('live_streams').getFullList({
        filter: `user = "${user.id}" && is_live = true`,
      });

      // End any existing streams
      for (const stream of existing) {
        await pb.collection('live_streams').update(stream.id, { is_live: false });
      }

      // Create the new stream record
      const stream = await pb.collection('live_streams').create({
        user: user.id,
        title,
        room_name: roomName,
        is_live: true,
        viewer_count: 0,
      });

      return stream;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
    },
  });
}

export function useStopStream() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      await pb.collection('live_streams').update(streamId, { is_live: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
    },
  });
}
