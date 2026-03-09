'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useProjectPaints(projectId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.projectPaints.byProject(projectId || ''),
    queryFn: async () => {
      return pb.collection('project_paints').getFullList({
        filter: `project="${projectId}"`,
        expand: 'paint',
        sort: '-created',
      });
    },
    enabled: !!projectId,
  });
}

export function useAddProjectPaint() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      paintId,
      notes,
    }: {
      projectId: string;
      paintId: string;
      notes?: string;
    }) => {
      return pb.collection('project_paints').create({
        project: projectId,
        paint: paintId,
        notes: notes || '',
        usage_count: 1,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectPaints.byProject(variables.projectId) });
    },
  });
}

export function useRemoveProjectPaint() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      return pb.collection('project_paints').delete(id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectPaints.byProject(variables.projectId) });
    },
  });
}
