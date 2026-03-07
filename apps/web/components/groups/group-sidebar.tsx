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
    <aside className="flex w-[60px] flex-col items-center gap-2 border-r border-gray-200 bg-gray-100 py-3 overflow-y-auto">
      {/* Discover */}
      <Link
        href="/groups"
        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all hover:rounded-xl ${
          !activeGroupId ? 'bg-primary-600 text-white rounded-xl' : 'bg-white text-gray-600 hover:bg-primary-50'
        }`}
        title="Discover Groups"
      >
        <Compass className="h-5 w-5" />
      </Link>

      <div className="mx-2 h-px w-8 bg-gray-300" />

      {/* Group icons */}
      {loading ? (
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-gray-200" />
      ) : (
        groups.map((group) => {
          const isActive = group.id === activeGroupId;
          const iconUrl = group.icon ? getFileUrl(group, group.icon) : null;

          return (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all hover:rounded-xl ${
                isActive ? 'rounded-xl bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-primary-50'
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
                <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-primary-600" />
              )}
            </Link>
          );
        })
      )}

      <div className="mx-2 h-px w-8 bg-gray-300" />

      {/* Create group */}
      <button
        onClick={() => setShowCreate(true)}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-green-600 transition-all hover:rounded-xl hover:bg-green-50"
        title="Create Group"
      >
        <Plus className="h-5 w-5" />
      </button>

      {showCreate && <CreateGroupDialog onClose={() => setShowCreate(false)} />}
    </aside>
  );
}
