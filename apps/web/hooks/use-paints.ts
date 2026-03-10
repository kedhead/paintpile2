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
      const records = await pb.collection('user_paints').getFullList({
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
      return pb.collection('user_paints').create({
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
      return pb.collection('user_paints').delete(inventoryId);
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
        name: data.name,
        brand: data.brand,
        hex_color: data.color,
        type: data.type,
        is_custom: true,
        created_by: user!.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paints.all });
    },
  });
}

export function usePaintBrands() {
  const { pb } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.paints.all, 'brands'],
    queryFn: async () => {
      // Fetch enough records (sorted by brand) to cover all distinct brands
      // With ~14 brands and ~4700 paints, sampling 500 sorted records covers them all
      const page = await pb.collection('paints').getList(1, 500, {
        fields: 'brand',
        sort: 'brand',
      });
      const brands = new Set<string>();
      for (const r of page.items) {
        if (r.brand) brands.add(r.brand);
      }
      // If there are more pages, the last brand in our sample might be incomplete
      // Fetch a sample from the end too
      if (page.totalPages > 1) {
        const lastPage = await pb.collection('paints').getList(page.totalPages, 500, {
          fields: 'brand',
          sort: 'brand',
        });
        for (const r of lastPage.items) {
          if (r.brand) brands.add(r.brand);
        }
      }
      return Array.from(brands).sort();
    },
    staleTime: 5 * 60 * 1000,
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
