'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useIsFollowing, useToggleFollow } from '../../hooks/use-follows';
import { useAuth } from '../auth-provider';

interface FollowButtonProps {
  targetUserId: string;
}

const Spinner = () => (
  <button disabled className="rounded-full border border-border px-4 py-1.5 text-sm">
    <Loader2 className="h-3.5 w-3.5 animate-spin" />
  </button>
);

export function FollowButton({ targetUserId }: FollowButtonProps) {
  const { loading: authLoading, user } = useAuth();
  // isPending = true whenever there is no cached data yet (covers the
  // disabled→enabled transition gap that isLoading misses in TanStack v5)
  const { data: isFollowing = false, isPending } = useIsFollowing(targetUserId);
  const toggleFollow = useToggleFollow();
  const [hovering, setHovering] = useState(false);

  // Auth still initialising
  if (authLoading) return <Spinner />;

  // Not logged in — follow button makes no sense for guests
  if (!user) return null;

  // Query not yet resolved (first fetch after auth becomes available)
  if (isPending) return <Spinner />;

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
