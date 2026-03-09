'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export function useChallenges() {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.challenges.list(),
    queryFn: async () => {
      return pb.collection('challenges').getFullList({
        sort: '-created',
      });
    },
  });
}

export function useChallenge(challengeId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.challenges.detail(challengeId || ''),
    queryFn: async () => {
      return pb.collection('challenges').getOne(challengeId!);
    },
    enabled: !!challengeId,
  });
}

export function useChallengeEntries(challengeId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.challenges.entries(challengeId || ''),
    queryFn: async () => {
      return pb.collection('challenge_entries').getFullList({
        filter: `challenge="${challengeId}"`,
        expand: 'user,project',
        sort: '-votes',
      });
    },
    enabled: !!challengeId,
  });
}

export function useSubmitEntry() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      challengeId,
      projectId,
      photoUrl,
      projectTitle,
    }: {
      challengeId: string;
      projectId: string;
      photoUrl?: string;
      projectTitle: string;
    }) => {
      return pb.collection('challenge_entries').create({
        challenge: challengeId,
        user: user!.id,
        project: projectId,
        photo_url: photoUrl || '',
        project_title: projectTitle,
        votes: 0,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.entries(variables.challengeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.detail(variables.challengeId) });
    },
  });
}

export function useVoteEntry() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, challengeId }: { entryId: string; challengeId: string }) => {
      const entry = await pb.collection('challenge_entries').getOne(entryId);
      return pb.collection('challenge_entries').update(entryId, {
        votes: (entry.votes || 0) + 1,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.entries(variables.challengeId) });
    },
  });
}
