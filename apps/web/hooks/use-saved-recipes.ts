'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useSavedRecipes() {
  const { pb, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.savedRecipes.my(),
    queryFn: async () => {
      return pb.collection('saved_recipes').getFullList({
        filter: `user="${user!.id}"`,
        expand: 'recipe',
        sort: '-created',
      });
    },
    enabled: !!user,
  });
}

export function useIsSaved(recipeId: string) {
  const { pb, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.savedRecipes.check(recipeId),
    queryFn: async () => {
      const result = await pb.collection('saved_recipes').getList(1, 1, {
        filter: `user="${user!.id}" && recipe="${recipeId}"`,
      });
      return result.totalItems > 0;
    },
    enabled: !!user && !!recipeId,
  });
}

export function useSaveRecipe() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      return pb.collection('saved_recipes').create({
        user: user!.id,
        recipe: recipeId,
      });
    },
    onSuccess: (_data, recipeId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedRecipes.all });
    },
  });
}

export function useUnsaveRecipe() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      const existing = await pb.collection('saved_recipes').getList(1, 1, {
        filter: `user="${user!.id}" && recipe="${recipeId}"`,
      });
      if (existing.items[0]) {
        await pb.collection('saved_recipes').delete(existing.items[0].id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedRecipes.all });
    },
  });
}
