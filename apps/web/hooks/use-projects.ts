'use client';

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';
import { logActivity } from './use-activities';
import { useCheckBadges } from './use-badges';

const PAGE_SIZE = 20;

export function useMyProjects() {
  const { pb, user } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.projects.my(),
    queryFn: async ({ pageParam = 1 }) => {
      return pb.collection('projects').getList(pageParam, PAGE_SIZE, {
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

export function usePublicProjects() {
  const { pb } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.projects.public(),
    queryFn: async ({ pageParam = 1 }) => {
      return pb.collection('projects').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        filter: 'is_public = true',
        expand: 'user',
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useProject(projectId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.projects.detail(projectId || ''),
    queryFn: async () => {
      return pb.collection('projects').getOne(projectId!, { expand: 'user' });
    },
    enabled: !!projectId,
  });
}

export function useUserProjects(userId: string) {
  const { pb } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.projects.byUser(userId),
    queryFn: async ({ pageParam = 1 }) => {
      return pb.collection('projects').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        filter: `user="${userId}" && is_public=true`,
        expand: 'user',
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useCreateProject() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();
  const { mutate: checkBadges } = useCheckBadges();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return pb.collection('projects').create(formData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      if (user) {
        logActivity(pb, user.id, {
          type: 'project_created',
          target_id: data.id,
          target_type: 'project',
          metadata: { target_name: data.name },
        });
        checkBadges();
      }
    },
  });
}

export function useUpdateProject() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();
  const { mutate: checkBadges } = useCheckBadges();

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: FormData | Record<string, unknown> }) => {
      return pb.collection('projects').update(projectId, data);
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.my() });
      // Log completion activity
      if (user && result.status === 'completed') {
        logActivity(pb, user.id, {
          type: 'project_completed',
          target_id: result.id,
          target_type: 'project',
          metadata: { target_name: result.name },
        });
        checkBadges();
      }
    },
  });
}

export function useDeleteProject() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      return pb.collection('projects').delete(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
