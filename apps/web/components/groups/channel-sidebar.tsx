'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Hash, Volume2, Settings, ChevronDown, Plus } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { useGroup } from '../../hooks/use-groups';
import { useMyGroupRole } from '../../hooks/use-my-role';
import { CreateChannelDialog } from './create-channel-dialog';

interface ChannelSidebarProps {
  groupId: string;
  channels: RecordModel[];
  activeChannelId: string | null;
  onSelect?: () => void;
}

export function ChannelSidebar({ groupId, channels, activeChannelId, onSelect }: ChannelSidebarProps) {
  const { data: group } = useGroup(groupId);
  const { canManageChannels } = useMyGroupRole(groupId);
  const [showCreate, setShowCreate] = useState(false);

  // Group by category
  const categories = new Map<string, RecordModel[]>();
  channels.forEach((ch: RecordModel) => {
    const cat = ch.category || '';
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(ch);
  });

  return (
    <aside className="flex w-[200px] flex-col border-r border-gray-200 bg-gray-50 h-full">
      {/* Group header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-3">
        <h2 className="truncate text-sm font-semibold text-gray-900">{group?.name || 'Loading...'}</h2>
        {canManageChannels && (
          <Link href={`/groups/${groupId}/settings`} className="text-gray-400 hover:text-gray-600">
            <Settings className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Channel list */}
      <nav className="flex-1 overflow-y-auto py-2">
        {Array.from(categories.entries()).map(([category, chans]) => (
          <div key={category || '__uncategorized'}>
            {category && (
              <div className="flex items-center gap-1 px-2 pt-3 pb-1">
                <ChevronDown className="h-3 w-3 text-gray-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {category}
                </span>
              </div>
            )}
            {chans.map((ch: RecordModel) => {
              const isActive = ch.id === activeChannelId;
              const Icon = ch.type === 'voice' ? Volume2 : Hash;
              return (
                <Link
                  key={ch.id}
                  href={`/groups/${groupId}/${ch.id}`}
                  onClick={onSelect}
                  className={`flex items-center gap-1.5 mx-1 rounded px-2 py-1 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0 opacity-60" />
                  <span className="truncate">{ch.name}</span>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Create channel button */}
        {canManageChannels && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 mx-1 rounded px-2 py-1 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-[calc(100%-8px)]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Channel</span>
          </button>
        )}
      </nav>

      {showCreate && (
        <CreateChannelDialog groupId={groupId} onClose={() => setShowCreate(false)} />
      )}
    </aside>
  );
}
