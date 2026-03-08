'use client';

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

const PAGE_SIZE = 20;

export function usePileItems() {
  const { pb, user } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.pile.items(),
    queryFn: async ({ pageParam = 1 }) => {
      return pb.collection('projects').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        filter: `user="${user!.id}" && tags ~ "shame"`,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!user,
  });
}

export function usePileStats() {
  const { pb, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.pile.stats(),
    queryFn: async () => {
      const items = await pb.collection('projects').getFullList({
        filter: `user="${user!.id}" && tags ~ "shame"`,
        fields: 'id,status',
      });

      const total = items.length;
      const notStarted = items.filter((i) => !i.status || i.status === 'not-started').length;
      const inProgress = items.filter((i) => i.status === 'in-progress').length;
      const completed = items.filter((i) => i.status === 'completed').length;
      const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { total, notStarted, inProgress, completed, completionPercent };
    },
    enabled: !!user,
  });
}

interface CreatePileItemInput {
  name: string;
  quantity?: number;
  status?: string;
  description?: string;
}

export function useCreatePileItem() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePileItemInput) => {
      const data: Record<string, unknown> = {
        name: input.name,
        user: user!.id,
        tags: JSON.stringify(['shame']),
        status: input.status || 'not-started',
      };
      if (input.quantity !== undefined) data.quantity = input.quantity;
      if (input.description) data.description = input.description;

      return pb.collection('projects').create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pile.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdatePileStatus() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, status }: { projectId: string; status: string }) => {
      return pb.collection('projects').update(projectId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pile.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useDeletePileItem() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      return pb.collection('projects').delete(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pile.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
