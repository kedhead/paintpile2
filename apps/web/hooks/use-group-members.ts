'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useGroupMembers(groupId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.groups.members(groupId || ''),
    queryFn: async () => {
      return pb.collection('group_members').getFullList({
        filter: `group = "${groupId}"`,
        expand: 'user',
        sort: 'role,created',
      });
    },
    enabled: !!groupId,
  });
}

export function useJoinGroup() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const membership = await pb.collection('group_members').create({
        group: groupId,
        user: user!.id,
        role: 'member',
      });

      // Increment member count
      const group = await pb.collection('groups').getOne(groupId);
      await pb.collection('groups').update(groupId, {
        member_count: (group.member_count || 0) + 1,
      });

      return membership;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
}

export function useLeaveGroup() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const memberships = await pb.collection('group_members').getFullList({
        filter: `group = "${groupId}" && user = "${user!.id}"`,
      });
      if (memberships.length > 0) {
        await pb.collection('group_members').delete(memberships[0].id);
      }

      const group = await pb.collection('groups').getOne(groupId);
      await pb.collection('groups').update(groupId, {
        member_count: Math.max(0, (group.member_count || 1) - 1),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
}

export function useUpdateMemberRole() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string; groupId: string }) => {
      return pb.collection('group_members').update(memberId, { role });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(variables.groupId) });
    },
  });
}

export function useKickMember() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, groupId }: { memberId: string; groupId: string }) => {
      await pb.collection('group_members').delete(memberId);

      const group = await pb.collection('groups').getOne(groupId);
      await pb.collection('groups').update(groupId, {
        member_count: Math.max(0, (group.member_count || 1) - 1),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(variables.groupId) });
    },
  });
}
