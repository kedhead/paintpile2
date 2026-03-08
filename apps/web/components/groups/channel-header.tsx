'use client';

import { Hash, Volume2, Users } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { useGroupMembers } from '../../hooks/use-group-members';

interface ChannelHeaderProps {
  channel: RecordModel;
  groupId: string;
}

export function ChannelHeader({ channel, groupId }: ChannelHeaderProps) {
  const { data: members } = useGroupMembers(groupId);
  const Icon = channel.type === 'voice' ? Volume2 : Hash;

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <h2 className="font-semibold text-foreground truncate">{channel.name}</h2>
        {channel.description && (
          <span className="hidden sm:inline text-sm text-muted-foreground ml-2 truncate">
            {channel.description}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span className="text-xs">{members?.length || 0}</span>
      </div>
    </div>
  );
}
