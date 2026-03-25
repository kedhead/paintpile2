'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import {
  Palette, Shield, ChefHat, Heart, UserPlus, MessageSquare,
  Sparkles, Trophy, UserCheck,
} from 'lucide-react';
import { getDisplayName } from '@paintpile/shared';
import { UserAvatar } from '../social/user-avatar';
import { relativeTime } from '../../lib/pb-helpers';

interface ActivityItemProps {
  activity: RecordModel;
}

const activityConfig: Record<string, { icon: typeof Palette; color: string; label: string }> = {
  project_created: { icon: Palette, color: 'text-blue-400', label: 'started a new project' },
  project_completed: { icon: Trophy, color: 'text-green-400', label: 'completed a project' },
  project_liked: { icon: Heart, color: 'text-red-400', label: 'liked a project' },
  army_created: { icon: Shield, color: 'text-purple-400', label: 'created an army' },
  army_liked: { icon: Heart, color: 'text-red-400', label: 'liked an army' },
  recipe_created: { icon: ChefHat, color: 'text-orange-400', label: 'shared a recipe' },
  recipe_liked: { icon: Heart, color: 'text-red-400', label: 'liked a recipe' },
  user_followed: { icon: UserPlus, color: 'text-cyan-400', label: 'followed someone' },
  comment_created: { icon: MessageSquare, color: 'text-yellow-400', label: 'left a comment' },
  project_critique_shared: { icon: Sparkles, color: 'text-amber-400', label: 'shared a critique' },
  user_joined: { icon: UserCheck, color: 'text-emerald-400', label: 'joined Paintpile' },
};

function getTargetLink(activity: RecordModel): string | null {
  const { target_type, target_id } = activity;
  if (target_type === 'project') return `/projects/${target_id}`;
  if (target_type === 'army') return `/projects/armies/${target_id}`;
  if (target_type === 'recipe') return `/recipes/${target_id}`;
  if (target_type === 'user') return `/profile/${target_id}`;
  return null;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const config = activityConfig[activity.type] || {
    icon: Palette,
    color: 'text-muted-foreground',
    label: activity.type,
  };
  const Icon = config.icon;
  const user = activity.expand?.user;
  const targetLink = getTargetLink(activity);
  const metadata = typeof activity.metadata === 'string'
    ? JSON.parse(activity.metadata || '{}')
    : (activity.metadata || {});

  const isCompact = ['project_liked', 'army_liked', 'recipe_liked', 'user_followed'].includes(activity.type);

  if (isCompact) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <Icon className={`h-4 w-4 flex-shrink-0 ${config.color}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground">
            <span className="font-medium">{getDisplayName(user, 'Someone')}</span>{' '}
            <span className="text-muted-foreground">{config.label}</span>
            {metadata.target_name && (
              <>
                {' '}
                {targetLink ? (
                  <Link href={targetLink} className="font-medium text-primary hover:underline">
                    {metadata.target_name}
                  </Link>
                ) : (
                  <span className="font-medium">{metadata.target_name}</span>
                )}
              </>
            )}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{relativeTime(activity.created)}</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        {user && <UserAvatar user={user} size="sm" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${config.color}`} />
            <p className="text-sm text-foreground">
              <span className="font-medium">{getDisplayName(user, 'Someone')}</span>{' '}
              <span className="text-muted-foreground">{config.label}</span>
            </p>
            <span className="text-xs text-muted-foreground">{relativeTime(activity.created)}</span>
          </div>

          {metadata.target_name && (
            <div className="mt-2">
              {targetLink ? (
                <Link
                  href={targetLink}
                  className="inline-block rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {metadata.target_name}
                </Link>
              ) : (
                <span className="text-sm text-foreground">{metadata.target_name}</span>
              )}
            </div>
          )}

          {metadata.image_url && (
            <div className="mt-2 overflow-hidden rounded-lg">
              <img
                src={metadata.image_url}
                alt={metadata.target_name || ''}
                className="max-h-48 w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
