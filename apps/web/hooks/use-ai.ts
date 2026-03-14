'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useAIQuota() {
  const { pb, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.aiQuota.user(user?.id || ''),
    queryFn: async () => {
      const quotas = await pb.collection('ai_quota').getFullList({
        filter: `user="${user!.id}"`,
      });
      return quotas[0] || null;
    },
    enabled: !!user,
  });
}

function useAIMutation<TInput, TResult>(endpoint: string) {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TInput): Promise<TResult> => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, pbToken: pb.authStore.token }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI request failed');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiQuota.all });
    },
  });
}

export function useAICritique() {
  return useAIMutation<
    { projectId: string; imageUrl: string },
    { success: boolean; data: { critique: Record<string, unknown>; creditsUsed: number } }
  >('/api/ai/critique');
}

export function usePaintSuggestions() {
  return useAIMutation<
    { imageUrl: string; context?: string },
    { success: boolean; data: Record<string, unknown> }
  >('/api/ai/suggest-paints');
}

export function useTechniqueAdvisor() {
  return useAIMutation<
    { imageUrl: string; question?: string },
    { success: boolean; data: Record<string, unknown> }
  >('/api/ai/technique-advisor');
}

export function useRecipeGeneration() {
  return useAIMutation<
    { imageUrl: string; context?: string },
    { success: boolean; data: { recipe: Record<string, unknown>; creditsUsed: number } }
  >('/api/ai/recipe');
}

export function useUpscale() {
  return useAIMutation<
    { imageUrl: string },
    { success: boolean; data: { imageUrl: string; creditsUsed: number } }
  >('/api/ai/upscale');
}

export function useRecolor() {
  return useAIMutation<
    { imageUrl: string; prompt: string },
    { success: boolean; data: { imageUrl: string; creditsUsed: number } }
  >('/api/ai/recolor');
}

export function useRecipeVideoScript() {
  return useAIMutation<
    { recipe: Record<string, unknown> },
    { success: boolean; data: { script: { step_index: number; narration: string; duration_seconds: number; text_overlay: string }[]; creditsUsed: number } }
  >('/api/ai/recipe-video-script');
}
