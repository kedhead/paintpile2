'use client';

import { useState, useEffect } from 'react';
import type { RecordModel } from 'pocketbase';
import { Hash } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { useChannels } from '../../hooks/use-channels';
import {
  useMessages,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useRealtimeMessages,
} from '../../hooks/use-messages';
import { ChannelList } from './channel-list';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';

export function ChatLayout() {
  const { user } = useAuth();
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  // Auto-select first channel
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  const { data: messagesData, isLoading: messagesLoading } = useMessages(selectedChannelId);
  const sendMessage = useSendMessage();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  useRealtimeMessages(selectedChannelId);

  const selectedChannel = channels?.find((c: RecordModel) => c.id === selectedChannelId);
  const messages = messagesData?.items || [];

  const handleSend = (content: string) => {
    if (!selectedChannelId) return;
    sendMessage.mutate({ channelId: selectedChannelId, content });
  };

  const handleEdit = (messageId: string, content: string) => {
    if (!selectedChannelId) return;
    editMessage.mutate({ messageId, channelId: selectedChannelId, content });
  };

  const handleDelete = (messageId: string) => {
    if (!selectedChannelId) return;
    deleteMessage.mutate({ messageId, channelId: selectedChannelId });
  };

  if (channelsLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center text-gray-400">
        Loading channels...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white md:flex-row">
      <ChannelList
        channels={channels || []}
        activeChannelId={selectedChannelId}
        onSelect={setSelectedChannelId}
      />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Channel header */}
        {selectedChannel && (
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
            <Hash className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">{selectedChannel.name}</h2>
            {selectedChannel.description && (
              <span className="hidden sm:inline text-sm text-gray-400 ml-2">
                {selectedChannel.description}
              </span>
            )}
          </div>
        )}

        {/* Messages */}
        {messagesLoading ? (
          <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
            Loading messages...
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={user?.id || ''}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Input */}
        <MessageInput onSend={handleSend} disabled={sendMessage.isPending || !selectedChannelId} />
      </div>
    </div>
  );
}
