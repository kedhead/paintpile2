'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

/** The signed-in painter's own boards, newest first. */
export function useMyCollections() {
  const { pb, user } = useAuth();
  return useQuery({
    queryKey: queryKeys.collections.mine(),
    queryFn: () =>
      pb.collection('project_collections').getFullList({
        filter: pb.filter('user = {:user}', { user: user!.id }),
        sort: '-updated',
      }),
    enabled: !!user,
  });
}

/** Map of collectionId -> itemId for the viewer's boards that contain this project. */
export function useSavedIn(projectId: string) {
  const { pb, user } = useAuth();
  return useQuery({
    queryKey: queryKeys.collections.savedIn(projectId),
    queryFn: async () => {
      const items = await pb.collection('project_collection_items').getFullList({
        filter: pb.filter('project = {:project} && collection.user = {:user}', { project: projectId, user: user!.id }),
      });
      return Object.fromEntries(items.map((i) => [i.collection as string, i.id])) as Record<string, string>;
    },
    enabled: !!user && !!projectId,
  });
}

export function useCreateCollection() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; is_public?: boolean }) =>
      pb.collection('project_collections').create({ user: user!.id, is_public: true, ...data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.collections.all }),
  });
}

export function useToggleSaved(projectId: string) {
  const { pb } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ collectionId, itemId }: { collectionId: string; itemId?: string }) => {
      if (itemId) {
        await pb.collection('project_collection_items').delete(itemId);
      } else {
        await pb.collection('project_collection_items').create({ collection: collectionId, project: projectId });
      }
      // Bump the board so "recently updated" ordering reflects the save.
      await pb.collection('project_collections').update(collectionId, {}).catch(() => {});
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.collections.all }),
  });
}

export function useUpdateCollection() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; is_public?: boolean } }) =>
      pb.collection('project_collections').update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.collections.all }),
  });
}

export function useDeleteCollection() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pb.collection('project_collections').delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.collections.all }),
  });
}

export function useRemoveFromCollection() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => pb.collection('project_collection_items').delete(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.collections.all }),
  });
}
