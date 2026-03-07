'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useGroupChannels(groupId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.groups.channels(groupId || ''),
    queryFn: async () => {
      return pb.collection('group_channels').getFullList({
        filter: `group = "${groupId}"`,
        sort: 'sort_order',
      });
    },
    enabled: !!groupId,
  });
}

export function useCreateChannel() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      name,
      type,
      category,
    }: {
      groupId: string;
      name: string;
      type: 'text' | 'voice';
      category?: string;
    }) => {
      return pb.collection('group_channels').create({
        group: groupId,
        name,
        type,
        category: category || '',
        sort_order: 999,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.channels(variables.groupId) });
    },
  });
}

export function useUpdateChannel() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      channelId,
      groupId,
      data,
    }: {
      channelId: string;
      groupId: string;
      data: Record<string, unknown>;
    }) => {
      return pb.collection('group_channels').update(channelId, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.channels(variables.groupId) });
    },
  });
}

export function useDeleteChannel() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelId, groupId }: { channelId: string; groupId: string }) => {
      return pb.collection('group_channels').delete(channelId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.channels(variables.groupId) });
    },
  });
}
