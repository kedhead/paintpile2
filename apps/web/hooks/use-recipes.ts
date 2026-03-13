'use client';

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';
import { logActivity } from './use-activities';
import { useCheckBadges } from './use-badges';

const PAGE_SIZE = 20;

export interface RecipeIngredient {
  paint_name: string;
  paint_color: string;
  role: 'base' | 'highlight' | 'shadow' | 'midtone' | 'glaze' | 'wash' | 'layer' | 'accent';
}

export interface RecipeStep {
  instruction: string;
  estimated_time: number;
}

export interface RecipeData {
  name: string;
  description?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
  techniques?: string[];
  is_public?: boolean;
}

export function useMyRecipes() {
  const { pb, user } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.recipes.my(),
    queryFn: async ({ pageParam = 1 }) => {
      return pb.collection('recipes').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        filter: `user="${user!.id}"`,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!user,
  });
}

export function usePublicRecipes() {
  const { pb } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.recipes.public(),
    queryFn: async ({ pageParam = 1 }) => {
      return pb.collection('recipes').getList(pageParam, PAGE_SIZE, {
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

export function useRecipe(recipeId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.recipes.detail(recipeId || ''),
    queryFn: async () => {
      return pb.collection('recipes').getOne(recipeId!, { expand: 'user' });
    },
    enabled: !!recipeId,
  });
}

export function useCreateRecipe() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();
  const { mutate: checkBadges } = useCheckBadges();

  return useMutation({
    mutationFn: async (data: RecipeData) => {
      return pb.collection('recipes').create({
        ...data,
        user: user!.id,
        ingredients: JSON.stringify(data.ingredients || []),
        steps: JSON.stringify(data.steps || []),
        techniques: JSON.stringify(data.techniques || []),
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      if (user) {
        logActivity(pb, user.id, {
          type: 'recipe_created',
          target_id: result.id,
          target_type: 'recipe',
          metadata: { target_name: result.name },
        });
        checkBadges();
      }
    },
  });
}

export function useUpdateRecipe() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();
  const { mutate: checkBadges } = useCheckBadges();

  return useMutation({
    mutationFn: async ({ recipeId, data }: { recipeId: string; data: Partial<RecipeData> }) => {
      const payload: Record<string, unknown> = { ...data };
      if (data.ingredients) payload.ingredients = JSON.stringify(data.ingredients);
      if (data.steps) payload.steps = JSON.stringify(data.steps);
      if (data.techniques) payload.techniques = JSON.stringify(data.techniques);
      return pb.collection('recipes').update(recipeId, payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.detail(variables.recipeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.my() });
      checkBadges();
    },
  });
}

export function useDeleteRecipe() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      return pb.collection('recipes').delete(recipeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
    },
  });
}
