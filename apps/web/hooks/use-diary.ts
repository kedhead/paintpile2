'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

const PAGE_SIZE = 20;

export interface DiaryEntryData {
  title: string;
  content: string;
  links?: { label: string; url: string }[];
  tags?: string[];
}

export function useMyDiary(search?: string, tag?: string) {
  const { pb, user } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.diary.my(search, tag),
    queryFn: async ({ pageParam = 1 }) => {
      let filter = `user="${user!.id}"`;
      if (search) filter += ` && (title~"${search}" || content~"${search}")`;
      if (tag) filter += ` && tags~"${tag}"`;

      return pb.collection('diary_entries').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        filter,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!user,
  });
}

export function useCreateDiaryEntry() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DiaryEntryData) => {
      return pb.collection('diary_entries').create({
        user: user!.id,
        title: data.title,
        content: data.content,
        links: JSON.stringify(data.links || []),
        tags: JSON.stringify(data.tags || []),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.diary.all });
    },
  });
}

export function useUpdateDiaryEntry() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, data }: { entryId: string; data: Partial<DiaryEntryData> }) => {
      const payload: Record<string, unknown> = { ...data };
      if (data.links) payload.links = JSON.stringify(data.links);
      if (data.tags) payload.tags = JSON.stringify(data.tags);
      return pb.collection('diary_entries').update(entryId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.diary.all });
    },
  });
}

export function useDeleteDiaryEntry() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      return pb.collection('diary_entries').delete(entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.diary.all });
    },
  });
}
