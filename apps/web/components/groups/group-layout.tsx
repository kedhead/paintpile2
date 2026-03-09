'use client';

import { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import type { RecordModel } from 'pocketbase';
import { useMyGroups } from '../../hooks/use-groups';
import { useGroupChannels } from '../../hooks/use-group-channels';
import { GroupSidebar } from './group-sidebar';
import { ChannelSidebar } from './channel-sidebar';

interface GroupLayoutProps {
  children: React.ReactNode;
}

export function GroupLayout({ children }: GroupLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const groupId = params?.groupId as string | undefined;
  const channelId = params?.channelId as string | undefined;
  const isSettingsRoute = pathname?.endsWith('/settings');
  const { data: myGroups, isLoading: groupsLoading } = useMyGroups();
  const { data: channels } = useGroupChannels(groupId || null);
  const [mobileChannelsOpen, setMobileChannelsOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Group icons strip */}
      <GroupSidebar
        groups={(myGroups as RecordModel[]) || []}
        activeGroupId={groupId || null}
        loading={groupsLoading}
      />

      {/* Channel sidebar - desktop (hidden on settings page) */}
      {groupId && !isSettingsRoute && (
        <>
          <div className="hidden md:block">
            <ChannelSidebar
              groupId={groupId}
              channels={channels || []}
              activeChannelId={channelId || null}
            />
          </div>

          {/* Mobile channel drawer */}
          {mobileChannelsOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileChannelsOpen(false)}
            >
              <div
                className="absolute left-[60px] top-[3.5rem] bottom-0 w-[200px]"
                onClick={(e) => e.stopPropagation()}
              >
                <ChannelSidebar
                  groupId={groupId}
                  channels={channels || []}
                  activeChannelId={channelId || null}
                  onSelect={() => setMobileChannelsOpen(false)}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile channel toggle */}
        {groupId && !isSettingsRoute && (
          <button
            className="md:hidden flex items-center gap-2 border-b border-border px-3 py-2 text-sm text-muted-foreground"
            onClick={() => setMobileChannelsOpen(!mobileChannelsOpen)}
          >
            Channels
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
