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
      const all = await pb.collection('paints').getFullList({
        fields: 'brand',
        sort: 'brand',
        batch: 500,
      });
      const brands = new Set<string>();
      for (const r of all) {
        if (r.brand) brands.add(r.brand);
      }
      return Array.from(brands).sort();
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function usePaintSets(brand?: string) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.paintSets.list(brand),
    queryFn: async () => {
      const filter = brand ? `brand="${brand}"` : '';
      return pb.collection('paint_sets').getFullList({
        sort: 'brand,set_name',
        filter,
      });
    },
  });
}

export function useAddSetToInventory() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paintNames: string[]) => {
      // Find all matching paints by name
      const results = { added: 0, skipped: 0, notFound: 0 };

      for (const name of paintNames) {
        try {
          // Find paint by name (fuzzy match)
          const matches = await pb.collection('paints').getList(1, 1, {
            filter: `name="${name.replace(/"/g, '\\"')}"`,
            requestKey: null,
          });

          if (matches.items.length === 0) {
            results.notFound++;
            continue;
          }

          const paintId = matches.items[0].id;

          // Check if already in inventory
          const existing = await pb.collection('user_paints').getList(1, 1, {
            filter: `user="${user!.id}" && paint="${paintId}"`,
            requestKey: null,
          });

          if (existing.items.length > 0) {
            results.skipped++;
            continue;
          }

          await pb.collection('user_paints').create({
            user: user!.id,
            paint: paintId,
          });
          results.added++;
        } catch {
          results.notFound++;
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paints.inventory() });
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
