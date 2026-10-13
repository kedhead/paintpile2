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
  /** Optional project this note belongs to ('' unlinks it). */
  project?: string;
}

export function useMyDiary(search?: string, tag?: string, projectId?: string) {
  const { pb, user } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.diary.my(search, tag, projectId),
    queryFn: async ({ pageParam = 1 }) => {
      const parts = [pb.filter('user = {:user}', { user: user!.id })];
      if (search) parts.push(pb.filter('(title ~ {:q} || content ~ {:q})', { q: search }));
      if (tag) parts.push(pb.filter('tags ~ {:tag}', { tag }));
      if (projectId) parts.push(pb.filter('project = {:project}', { project: projectId }));

      return pb.collection('diary_entries').getList(pageParam, PAGE_SIZE, {
        sort: '-created',
        filter: parts.join(' && '),
        expand: 'project',
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
        ...(data.project ? { project: data.project } : {}),
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
