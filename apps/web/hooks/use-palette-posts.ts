'use client';

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';
import type { PalettePostData } from '../lib/palette-post-types';

const PAGE_SIZE = 20;

export function usePalettePosts() {
  const { pb, user } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.palettePosts.my(),
    queryFn: async ({ pageParam = 1 }) => {
      return pb.collection('palette_posts').getList(pageParam, PAGE_SIZE, {
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

export function usePalettePost(id: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.palettePosts.detail(id || ''),
    queryFn: async () => {
      return pb.collection('palette_posts').getOne(id!);
    },
    enabled: !!id,
  });
}

export function useCreatePalettePost() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PalettePostData & { imageBlob?: Blob; mediaFiles?: File[] }) => {
      const formData = new FormData();
      formData.append('user', user!.id);
      formData.append('title', data.title);
      formData.append('paints', JSON.stringify(data.paints));
      formData.append('theme', data.theme);
      formData.append('background_color', data.background_color);
      formData.append('layout', data.layout);
      formData.append('caption', data.caption);
      formData.append('is_public', String(data.is_public));
      if (data.project) formData.append('project', data.project);

      if (data.imageBlob) {
        formData.append('image', new File([data.imageBlob], 'palette-post.png', { type: 'image/png' }));
      }

      if (data.mediaFiles) {
        for (const file of data.mediaFiles) {
          formData.append('media', file);
        }
      }

      return pb.collection('palette_posts').create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.palettePosts.all });
    },
  });
}

export function useUpdatePalettePost() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PalettePostData> }) => {
      const payload: Record<string, unknown> = { ...data };
      if (data.paints) payload.paints = JSON.stringify(data.paints);
      delete payload.media;
      return pb.collection('palette_posts').update(id, payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.palettePosts.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.palettePosts.my() });
    },
  });
}

export function useDeletePalettePost() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return pb.collection('palette_posts').delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.palettePosts.all });
    },
  });
}
