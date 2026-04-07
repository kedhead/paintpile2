'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useIsFollowing, useToggleFollow } from '../../hooks/use-follows';
import { useAuth } from '../auth-provider';

interface FollowButtonProps {
  targetUserId: string;
  /** Pre-loaded follow status — skips the individual query when provided */
  initialIsFollowing?: boolean;
}

const Spinner = () => (
  <button disabled className="rounded-full border border-border px-4 py-1.5 text-sm">
    <Loader2 className="h-3.5 w-3.5 animate-spin" />
  </button>
);

export function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
  const { loading: authLoading, user } = useAuth();
  const { data: queryIsFollowing, isPending } = useIsFollowing(targetUserId, initialIsFollowing !== undefined);
  const toggleFollow = useToggleFollow();
  const [hovering, setHovering] = useState(false);

  if (authLoading) return <Spinner />;
  if (!user) return null;

  // Use pre-loaded value if provided, otherwise use query result
  const isFollowing = initialIsFollowing !== undefined ? initialIsFollowing : queryIsFollowing ?? false;

  // Only show spinner if we're waiting on the query (not when initialIsFollowing is provided)
  if (initialIsFollowing === undefined && isPending) return <Spinner />;

  const handleClick = () => {
    toggleFollow.mutate({ targetUserId, isFollowing });
  };

  if (isFollowing) {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        disabled={toggleFollow.isPending}
        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
          hovering
            ? 'border-red-200 bg-red-900/30 text-red-400'
            : 'border-border bg-card text-foreground'
        }`}
      >
        {hovering ? 'Unfollow' : 'Following'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={toggleFollow.isPending}
      className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
    >
      Follow
    </button>
  );
}
