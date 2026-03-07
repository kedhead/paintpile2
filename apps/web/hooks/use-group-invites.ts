'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useGroupInvites(groupId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.groups.invites(groupId || ''),
    queryFn: async () => {
      return pb.collection('group_invites').getFullList({
        filter: `group = "${groupId}"`,
        sort: '-created',
        expand: 'created_by',
      });
    },
    enabled: !!groupId,
  });
}

export function useInviteByCode(code: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.groups.inviteByCode(code || ''),
    queryFn: async () => {
      const invites = await pb.collection('group_invites').getFullList({
        filter: `code = "${code}"`,
        expand: 'group',
      });
      return invites[0] || null;
    },
    enabled: !!code,
  });
}

export function useCreateInvite() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, maxUses }: { groupId: string; maxUses?: number }) => {
      const code = crypto.randomUUID().slice(0, 8);
      return pb.collection('group_invites').create({
        group: groupId,
        created_by: user!.id,
        code,
        max_uses: maxUses || 0,
        use_count: 0,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.invites(variables.groupId) });
    },
  });
}

export function useDeleteInvite() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inviteId, groupId }: { inviteId: string; groupId: string }) => {
      return pb.collection('group_invites').delete(inviteId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.invites(variables.groupId) });
    },
  });
}
