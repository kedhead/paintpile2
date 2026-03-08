'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Compass } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { getFileUrl } from '../../lib/pb-helpers';
import { CreateGroupDialog } from './create-group-dialog';

interface GroupSidebarProps {
  groups: RecordModel[];
  activeGroupId: string | null;
  loading: boolean;
}

export function GroupSidebar({ groups, activeGroupId, loading }: GroupSidebarProps) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <aside className="flex w-[60px] flex-col items-center gap-2 border-r border-border bg-muted py-3 overflow-y-auto">
      {/* Discover */}
      <Link
        href="/groups"
        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all hover:rounded-xl ${
          !activeGroupId ? 'bg-primary text-white rounded-xl' : 'bg-card text-muted-foreground hover:bg-primary/10'
        }`}
        title="Discover Groups"
      >
        <Compass className="h-5 w-5" />
      </Link>

      <div className="mx-2 h-px w-8 bg-muted" />

      {/* Group icons */}
      {loading ? (
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-muted" />
      ) : (
        groups.map((group) => {
          const isActive = group.id === activeGroupId;
          const iconUrl = group.icon ? getFileUrl(group, group.icon) : null;

          return (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all hover:rounded-xl ${
                isActive ? 'rounded-xl bg-primary text-white' : 'bg-card text-foreground hover:bg-primary/10'
              }`}
              title={group.name}
            >
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt={group.name}
                  className="h-full w-full rounded-[inherit] object-cover"
                />
              ) : (
                <span className="text-sm font-bold">{group.name[0]?.toUpperCase()}</span>
              )}
              {isActive && (
                <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-primary" />
              )}
            </Link>
          );
        })
      )}

      <div className="mx-2 h-px w-8 bg-muted" />

      {/* Create group */}
      <button
        onClick={() => setShowCreate(true)}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-green-400 transition-all hover:rounded-xl hover:bg-green-900/30"
        title="Create Group"
      >
        <Plus className="h-5 w-5" />
      </button>

      {showCreate && <CreateGroupDialog onClose={() => setShowCreate(false)} />}
    </aside>
  );
}
