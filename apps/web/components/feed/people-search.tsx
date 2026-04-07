'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Loader2, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { RecordModel } from 'pocketbase';
import { getDisplayName } from '@paintpile/shared';
import { useAuth } from '../auth-provider';
import { UserAvatar } from '../social/user-avatar';
import { FollowButton } from '../social/follow-button';

export function PeopleSearch() {
  const { pb, user } = useAuth();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const safe = debounced.replace(/["\\%]/g, '');

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['users', 'people-search', safe],
    queryFn: async () => {
      const filter = safe
        ? `(name~"${safe}" || username~"${safe}") && id != "${user!.id}"`
        : `id != "${user!.id}"`;
      const result = await pb.collection('users').getList(1, 24, {
        filter,
        sort: safe ? '' : '-created',
        fields: 'id,name,username,avatar,bio',
      });
      return result.items as RecordModel[];
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  // Single query to get ALL users the current user follows — not dependent on results list
  const { data: followingSet, isLoading: followsLoading } = useQuery({
    queryKey: ['follows', 'my-following-set', user?.id || ''],
    queryFn: async () => {
      if (!user) return new Set<string>();
      const records = await pb.collection('follows').getFullList({
        filter: `follower="${user.id}"`,
        fields: 'following',
      });
      return new Set(records.map((r) => r.following as string));
    },
    enabled: !!user,
    staleTime: 10_000,
  });

  const loading = isLoading || followsLoading;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search painters by name or @username…"
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Users className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {safe ? `No painters found for "${safe}"` : 'No other painters yet'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {!safe && (
            <div className="border-b border-border px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Suggested Painters
              </p>
            </div>
          )}
          <div className="divide-y divide-border">
            {results.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                <Link href={`/profile/${u.id}`} className="shrink-0">
                  <UserAvatar user={u} size="md" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/profile/${u.id}`}
                    className="block truncate text-sm font-medium text-foreground hover:underline"
                  >
                    {getDisplayName(u)}
                  </Link>
                  {u.username && (
                    <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
                  )}
                  {u.bio && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{u.bio}</p>
                  )}
                </div>
                <FollowButton
                  targetUserId={u.id}
                  initialIsFollowing={followingSet ? followingSet.has(u.id) : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
