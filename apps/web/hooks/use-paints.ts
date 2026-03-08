'use client';

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

const PAGE_SIZE = 20;

export function usePaintDatabase(search?: string, brand?: string) {
  const { pb } = useAuth();

  return useInfiniteQuery({
    queryKey: [...queryKeys.paints.database(), search, brand],
    queryFn: async ({ pageParam = 1 }) => {
      const filters: string[] = [];
      if (search?.trim()) {
        filters.push(`name~"${search.trim()}"`);
      }
      if (brand?.trim()) {
        filters.push(`brand="${brand.trim()}"`);
      }
      const filter = filters.length > 0 ? filters.join(' && ') : '';

      return pb.collection('paints').getList(pageParam, PAGE_SIZE, {
        sort: 'brand,name',
        filter,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useMyInventory() {
  const { pb, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.paints.inventory(),
    queryFn: async () => {
      // Fetch all inventory records for this user, expanding the paint relation
      const records = await pb.collection('paint_inventory').getFullList({
        filter: `user="${user!.id}"`,
        expand: 'paint',
        sort: '-created',
      });
      return records;
    },
    enabled: !!user,
  });
}

export function useAddToInventory() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paintId: string) => {
      return pb.collection('paint_inventory').create({
        user: user!.id,
        paint: paintId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paints.inventory() });
    },
  });
}

export function useRemoveFromInventory() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inventoryId: string) => {
      return pb.collection('paint_inventory').delete(inventoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paints.inventory() });
    },
  });
}

export function useCreateCustomPaint() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { brand: string; name: string; color: string; type: string }) => {
      return pb.collection('paints').create({
        ...data,
        is_custom: true,
        created_by: user!.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paints.all });
    },
  });
}

export function useDeleteCustomPaint() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paintId: string) => {
      return pb.collection('paints').delete(paintId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paints.all });
    },
  });
}
