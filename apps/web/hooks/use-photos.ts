'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useProjectPhotos(projectId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.photos.byProject(projectId || ''),
    queryFn: async () => {
      return pb.collection('photos').getFullList({
        filter: `project="${projectId}"`,
        sort: '-created',
      });
    },
    enabled: !!projectId,
  });
}

export function useUploadPhoto() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      file,
      caption,
    }: {
      projectId: string;
      file: File;
      caption?: string;
    }) => {
      const formData = new FormData();
      formData.append('user', user!.id);
      formData.append('project', projectId);
      formData.append('file', file);
      if (caption) formData.append('caption', caption);

      // Get image dimensions
      const dimensions = await getImageDimensions(file);
      formData.append('width', String(dimensions.width));
      formData.append('height', String(dimensions.height));

      return pb.collection('photos').create(formData);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.byProject(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
    },
  });
}

export function useDeletePhoto() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, projectId }: { photoId: string; projectId: string }) => {
      return pb.collection('photos').delete(photoId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.byProject(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
    },
  });
}

export function useUpdatePhoto() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      photoId,
      data,
    }: {
      photoId: string;
      projectId: string;
      data: Record<string, unknown>;
    }) => {
      return pb.collection('photos').update(photoId, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.byProject(variables.projectId) });
    },
  });
}

export function useUpdatePhotoAnnotations() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      photoId,
      annotations,
    }: {
      photoId: string;
      projectId: string;
      annotations: PhotoAnnotation[];
    }) => {
      return pb.collection('photos').update(photoId, {
        annotations: JSON.stringify(annotations),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.byProject(variables.projectId) });
    },
  });
}

export interface PhotoAnnotation {
  id: string;
  x: number;
  y: number;
  label: string;
  notes?: string;
  recipeId?: string;
  paints?: { paintId: string; role: string; ratio?: number; notes?: string }[];
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
