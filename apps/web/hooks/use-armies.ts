'use client';

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';
import { logActivity } from './use-activities';
import { useCheckBadges } from './use-badges';

const PAGE_SIZE = 20;

export function useMyArmies() {
  const { pb, user } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.armies.my(),
    queryFn: async ({ pageParam = 1 }) => {
      return pb.collection('armies').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        filter: `user="${user!.id}"`,
        expand: 'user',
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!user,
  });
}

export function useArmy(armyId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.armies.detail(armyId || ''),
    queryFn: async () => {
      return pb.collection('armies').getOne(armyId!, { expand: 'user' });
    },
    enabled: !!armyId,
  });
}

export function useCreateArmy() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();
  const { mutate: checkBadges } = useCheckBadges();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return pb.collection('armies').create(formData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armies.all });
      if (user) {
        logActivity(pb, user.id, {
          type: 'army_created',
          target_id: data.id,
          target_type: 'army',
          metadata: { target_name: data.name },
        });
        checkBadges();
      }
    },
  });
}

export function useUpdateArmy() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ armyId, data }: { armyId: string; data: FormData | Record<string, unknown> }) => {
      return pb.collection('armies').update(armyId, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armies.detail(variables.armyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.armies.my() });
    },
  });
}

export function useDeleteArmy() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (armyId: string) => {
      return pb.collection('armies').delete(armyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armies.all });
    },
  });
}

export function useArmyMembers(armyId: string | null) {
  const { pb } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.armies.members(armyId || ''),
    queryFn: async ({ pageParam = 1 }) => {
      // Fetch members without expand to avoid viewRule issues on projects
      const members = await pb.collection('army_members').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        filter: `army="${armyId}"`,
      });

      // Batch-fetch the referenced projects individually
      const projectIds = members.items.map((m) => m.project).filter(Boolean);
      if (projectIds.length > 0) {
        const filter = projectIds.map((id) => `id="${id}"`).join(' || ');
        try {
          const projects = await pb.collection('projects').getFullList({ filter, requestKey: null });
          const projectMap = new Map(projects.map((p) => [p.id, p]));
          members.items = members.items.map((m) => ({
            ...m,
            expand: { ...m.expand, project: projectMap.get(m.project) },
          }));
        } catch {
          // Projects may have been deleted — continue without expand
        }
      }

      return members;
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!armyId,
  });
}

export function useAddArmyMember() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ armyId, projectId, unitCount = 1 }: { armyId: string; projectId: string; unitCount?: number }) => {
      return pb.collection('army_members').create({
        army: armyId,
        project: projectId,
        unit_count: unitCount,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armies.members(variables.armyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.armies.detail(variables.armyId) });
    },
  });
}

export function useRemoveArmyMember() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, armyId }: { memberId: string; armyId: string }) => {
      return pb.collection('army_members').delete(memberId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.armies.members(variables.armyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.armies.detail(variables.armyId) });
    },
  });
}
