'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';
import { queryKeys } from '../lib/query-keys';

export type TimelineEventType =
  | 'project_created'
  | 'project_updated'
  | 'photo_added'
  | 'paint_added'
  | 'recipe_created'
  | 'recipe_updated'
  | 'technique_added'
  | 'status_changed'
  | 'annotation_added';

export function useProjectTimeline(projectId: string | null) {
  const { pb } = useAuth();

  return useQuery({
    queryKey: queryKeys.timeline.byProject(projectId || ''),
    queryFn: async () => {
      return pb.collection('timeline').getFullList({
        filter: `project="${projectId}"`,
        sort: '-created',
        expand: 'user',
      });
    },
    enabled: !!projectId,
  });
}

export async function createTimelineEvent(
  pb: ReturnType<typeof useAuth>['pb'],
  data: {
    project: string;
    user: string;
    type: TimelineEventType;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    await pb.collection('timeline').create({
      project: data.project,
      user: data.user,
      type: data.type,
      metadata: JSON.stringify(data.metadata || {}),
    });
  } catch {
    console.error('Failed to create timeline event');
  }
}
