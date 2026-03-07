'use client';

import { Hash } from 'lucide-react';
import type { RecordModel } from 'pocketbase';

interface ChannelListProps {
  channels: RecordModel[];
  activeChannelId: string | null;
  onSelect: (channelId: string) => void;
}

export function ChannelList({ channels, activeChannelId, onSelect }: ChannelListProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-gray-200 bg-gray-50">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Channels</h2>
        </div>
        <nav className="flex-1 overflow-y-auto py-1">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onSelect(channel.id)}
              className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                activeChannelId === channel.id
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Hash className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile horizontal tabs */}
      <div className="flex md:hidden overflow-x-auto border-b border-gray-200 bg-gray-50 px-2 py-1 gap-1">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelect(channel.id)}
            className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
              activeChannelId === channel.id
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Hash className="h-3.5 w-3.5" />
            {channel.name}
          </button>
        ))}
      </div>
    </>
  );
}
