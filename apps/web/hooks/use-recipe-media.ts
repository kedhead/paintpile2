'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useRecipeMedia(recipeId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.recipeMedia.byRecipe(recipeId || ''),
    queryFn: async () => {
      return pb.collection('recipe_step_media').getFullList({
        filter: `recipe="${recipeId}"`,
        sort: 'sort_order',
      });
    },
    enabled: !!recipeId,
  });
}

export function useUploadRecipeMedia() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      stepId,
      file,
      sortOrder,
      caption,
    }: {
      recipeId: string;
      stepId: string;
      file: File;
      sortOrder: number;
      caption?: string;
    }) => {
      const formData = new FormData();
      formData.append('recipe', recipeId);
      formData.append('step_id', stepId);
      formData.append('image', file);
      formData.append('sort_order', String(sortOrder));
      if (caption) formData.append('caption', caption);

      const dimensions = await getImageDimensions(file);
      formData.append('width', String(dimensions.width));
      formData.append('height', String(dimensions.height));

      return pb.collection('recipe_step_media').create(formData);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipeMedia.byRecipe(variables.recipeId),
      });
    },
  });
}

export function useDeleteRecipeMedia() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mediaId, recipeId }: { mediaId: string; recipeId: string }) => {
      return pb.collection('recipe_step_media').delete(mediaId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipeMedia.byRecipe(variables.recipeId),
      });
    },
  });
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}
