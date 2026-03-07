'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  const router = useRouter();
  const groupId = params?.groupId as string | undefined;
  const channelId = params?.channelId as string | undefined;
  const { data: myGroups, isLoading: groupsLoading } = useMyGroups();
  const { data: channels } = useGroupChannels(groupId || null);
  const [mobileChannelsOpen, setMobileChannelsOpen] = useState(false);

  // Auto-redirect to first text channel
  useEffect(() => {
    if (groupId && channels && channels.length > 0 && !channelId) {
      const firstText = channels.find((c: RecordModel) => c.type === 'text');
      if (firstText) {
        router.replace(`/groups/${groupId}/${firstText.id}`);
      }
    }
  }, [groupId, channels, channelId, router]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Group icons strip */}
      <GroupSidebar
        groups={(myGroups as RecordModel[]) || []}
        activeGroupId={groupId || null}
        loading={groupsLoading}
      />

      {/* Channel sidebar - desktop */}
      {groupId && (
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
        {groupId && (
          <button
            className="md:hidden flex items-center gap-2 border-b border-gray-200 px-3 py-2 text-sm text-gray-600"
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
