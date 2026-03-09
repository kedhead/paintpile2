'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useProjectRecipes(projectId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.projectRecipes.byProject(projectId || ''),
    queryFn: async () => {
      return pb.collection('project_recipes').getFullList({
        filter: `project="${projectId}"`,
        expand: 'recipe',
        sort: '-created',
      });
    },
    enabled: !!projectId,
  });
}

export function useLinkRecipe() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      recipeId,
      appliedTo,
      notes,
    }: {
      projectId: string;
      recipeId: string;
      appliedTo?: string;
      notes?: string;
    }) => {
      return pb.collection('project_recipes').create({
        project: projectId,
        recipe: recipeId,
        applied_to: appliedTo || '',
        notes: notes || '',
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRecipes.byProject(variables.projectId) });
    },
  });
}

export function useUnlinkRecipe() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      return pb.collection('project_recipes').delete(id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRecipes.byProject(variables.projectId) });
    },
  });
}
