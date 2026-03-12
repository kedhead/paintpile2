'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { getDisplayName } from '@paintpile/shared';
import { UserAvatar } from './user-avatar';
import { FollowButton } from './follow-button';

interface UserCardProps {
  user: RecordModel;
  showFollowButton?: boolean;
  currentUserId?: string;
}

export function UserCard({ user, showFollowButton = false, currentUserId }: UserCardProps) {
  const isOwnProfile = currentUserId === user.id;

  return (
    <div className="flex items-center gap-3 py-2">
      <Link href={`/profile/${user.id}`}>
        <UserAvatar user={user} size="md" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${user.id}`}
          className="block truncate text-sm font-medium text-foreground hover:underline"
        >
          {getDisplayName(user)}
        </Link>
      </div>
      {showFollowButton && !isOwnProfile && (
        <FollowButton targetUserId={user.id} />
      )}
    </div>
  );
}
