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

/** Returns set of entry IDs the current user has voted for in this challenge */
export function useMyVotes(challengeId: string | null) {
  const { pb, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.challenges.votes(challengeId || '', user?.id || ''),
    queryFn: async () => {
      const votes = await pb.collection('challenge_votes').getFullList({
        filter: `challenge="${challengeId}" && user="${user!.id}"`,
      });
      return new Set(votes.map((v) => v.entry));
    },
    enabled: !!challengeId && !!user,
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
      const entry = await pb.collection('challenge_entries').create({
        challenge: challengeId,
        user: user!.id,
        project: projectId,
        photo_url: photoUrl || '',
        project_title: projectTitle,
        votes: 0,
      });

      // Increment participant_count on the challenge
      try {
        const challenge = await pb.collection('challenges').getOne(challengeId);
        await pb.collection('challenges').update(challengeId, {
          participant_count: (challenge.participant_count || 0) + 1,
        });
      } catch {
        // non-critical
      }

      return entry;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.entries(variables.challengeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.detail(variables.challengeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.list() });
    },
  });
}

export function useVoteEntry() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, challengeId }: { entryId: string; challengeId: string }) => {
      // Create a vote record (unique index prevents duplicates)
      await pb.collection('challenge_votes').create({
        user: user!.id,
        entry: entryId,
        challenge: challengeId,
      });

      // Increment vote count on the entry
      const entry = await pb.collection('challenge_entries').getOne(entryId);
      return pb.collection('challenge_entries').update(entryId, {
        votes: (entry.votes || 0) + 1,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.entries(variables.challengeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.votes(variables.challengeId, user?.id || '') });
    },
  });
}

export function useUnvoteEntry() {
  const { pb, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, challengeId }: { entryId: string; challengeId: string }) => {
      // Find and delete the vote record
      const votes = await pb.collection('challenge_votes').getFullList({
        filter: `user="${user!.id}" && entry="${entryId}"`,
      });
      if (votes.length > 0) {
        await pb.collection('challenge_votes').delete(votes[0].id);
      }

      // Decrement vote count on the entry
      const entry = await pb.collection('challenge_entries').getOne(entryId);
      return pb.collection('challenge_entries').update(entryId, {
        votes: Math.max(0, (entry.votes || 0) - 1),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.entries(variables.challengeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.votes(variables.challengeId, user?.id || '') });
    },
  });
}
