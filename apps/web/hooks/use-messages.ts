'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

const PAGE_SIZE = 50;

export function useMessages(channelId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.messages.byChannel(channelId || ''),
    queryFn: async () => {
      return pb.collection('messages').getList(1, PAGE_SIZE, {
        sort: 'created',
        filter: `channel = "${channelId}"`,
        expand: 'user',
      });
    },
    enabled: !!channelId,
  });
}

export function useSendMessage() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      channelId,
      content,
      image,
    }: {
      channelId: string;
      content: string;
      image?: File;
    }) => {
      const formData = new FormData();
      formData.append('channel', channelId);
      formData.append('content', content);
      formData.append('user', user!.id);
      if (image) formData.append('image', image);

      return pb.collection('messages').create(formData, { expand: 'user' });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byChannel(variables.channelId),
      });
    },
  });
}

export function useEditMessage() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      content,
    }: {
      messageId: string;
      channelId: string;
      content: string;
    }) => {
      return pb.collection('messages').update(messageId, {
        content,
        edited: true,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byChannel(variables.channelId),
      });
    },
  });
}

export function useDeleteMessage() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
    }: {
      messageId: string;
      channelId: string;
    }) => {
      return pb.collection('messages').delete(messageId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byChannel(variables.channelId),
      });
    },
  });
}

export function useRealtimeMessages(channelId: string | null) {
  const queryClient = useQueryClient();
  const { pb } = useAuth();

  useEffect(() => {
    if (!channelId) return;

    let unsubscribe: (() => void) | undefined;

    pb.collection('messages').subscribe('*', (e) => {
      if (e.record.channel === channelId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.messages.byChannel(channelId),
        });
      }
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      unsubscribe?.();
    };
  }, [channelId, pb, queryClient]);
}
