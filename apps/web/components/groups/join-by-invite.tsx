'use client';

import { useRouter } from 'next/navigation';
import { useInviteByCode } from '../../hooks/use-group-invites';
import { useJoinGroup } from '../../hooks/use-group-members';
import { useAuth } from '../auth-provider';
import { useState } from 'react';

interface JoinByInviteProps {
  code: string;
}

export function JoinByInvite({ code }: JoinByInviteProps) {
  const router = useRouter();
  const { data: group, isLoading } = useInviteByCode(code);
  const joinGroup = useJoinGroup();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!group) return;
    setError(null);
    try {
      await joinGroup.mutateAsync(group.id);
      router.push(`/groups/${group.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to join group';
      if (msg.includes('unique') || msg.includes('already')) {
        // Already a member, just redirect
        router.push(`/groups/${group.id}`);
      } else {
        setError(msg);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading invite...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-bold text-foreground mb-2">Invalid Invite</h2>
        <p className="text-sm text-muted-foreground mb-4">This invite link is invalid or has expired.</p>
        <button
          onClick={() => router.push('/groups')}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/80"
        >
          Browse Groups
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary text-xl font-bold mb-4">
        {group.name[0]?.toUpperCase()}
      </div>
      <h2 className="text-xl font-bold text-foreground mb-1">Join {group.name}</h2>
      {group.description && (
        <p className="text-sm text-muted-foreground mb-1 text-center max-w-xs">{group.description}</p>
      )}
      <p className="text-xs text-muted-foreground mb-6">{group.member_count || 0} members</p>
      {error && (
        <p className="mb-4 text-sm text-red-400">{error}</p>
      )}
      <button
        onClick={handleJoin}
        disabled={joinGroup.isPending}
        className="rounded-lg bg-primary px-6 py-2 text-sm text-white hover:bg-primary/80 disabled:opacity-50"
      >
        {joinGroup.isPending ? 'Joining...' : 'Accept Invite'}
      </button>
    </div>
  );
}
