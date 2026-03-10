'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useMyGroups() {
  const { pb, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.groups.my(),
    queryFn: async () => {
      const memberships = await pb.collection('group_members').getFullList({
        filter: `user = "${user!.id}"`,
        expand: 'group',
      });
      return memberships.map((m) => m.expand?.group).filter(Boolean);
    },
    enabled: !!user,
  });
}

export function usePublicGroups() {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.groups.public(),
    queryFn: async () => {
      return pb.collection('groups').getFullList({
        filter: 'is_public = true',
        sort: '-created',
      });
    },
  });
}

export function useGroup(groupId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.groups.detail(groupId || ''),
    queryFn: async () => {
      return pb.collection('groups').getOne(groupId!);
    },
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description, icon, isPublic = true }: { name: string; description?: string; icon?: File; isPublic?: boolean }) => {
      const formData = new FormData();
      formData.append('name', name);
      if (description) formData.append('description', description);
      if (icon) formData.append('icon', icon);
      formData.append('owner', user!.id);
      formData.append('member_count', '1');
      formData.append('is_public', String(isPublic));
      formData.append('invite_code', crypto.randomUUID().slice(0, 8));

      const group = await pb.collection('groups').create(formData);

      // Auto-create #general channel
      await pb.collection('group_channels').create({
        group: group.id,
        name: 'general',
        type: 'text',
        sort_order: 0,
      });

      // Auto-join creator as admin
      await pb.collection('group_members').create({
        group: group.id,
        user: user!.id,
        role: 'admin',
      });

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
}

export function useUpdateGroup() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, data }: { groupId: string; data: FormData }) => {
      return pb.collection('groups').update(groupId, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.my() });
    },
  });
}

export function useDeleteGroup() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      return pb.collection('groups').delete(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
}
