'use client';

import { useParams } from 'next/navigation';
import type { RecordModel } from 'pocketbase';
import { useAuth } from '../../../../../components/auth-provider';
import { useGroupChannels } from '../../../../../hooks/use-group-channels';
import { useGroupMembers } from '../../../../../hooks/use-group-members';
import {
  useGroupMessages,
  useSendGroupMessage,
  useEditGroupMessage,
  useDeleteGroupMessage,
  useRealtimeGroupMessages,
} from '../../../../../hooks/use-group-messages';
import { ChannelHeader } from '../../../../../components/groups/channel-header';
import { MessageList } from '../../../../../components/chat/message-list';
import { MessageInput } from '../../../../../components/chat/message-input';
import { MemberList } from '../../../../../components/groups/member-list';
import { InviteButton } from '../../../../../components/groups/invite-button';
import { VoiceChannel } from '../../../../../components/groups/voice/voice-channel';

export default function ChannelPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const channelId = params.channelId as string;
  const { user } = useAuth();

  const { data: channels } = useGroupChannels(groupId);
  const { data: members } = useGroupMembers(groupId);
  const { data: messagesData, isLoading: messagesLoading } = useGroupMessages(channelId);
  const sendMessage = useSendGroupMessage();
  const editMessage = useEditGroupMessage();
  const deleteMessage = useDeleteGroupMessage();
  useRealtimeGroupMessages(channelId);

  const channel = channels?.find((c: RecordModel) => c.id === channelId);
  const messages = messagesData?.items || [];

  const handleSend = (content: string) => {
    sendMessage.mutate({ channelId, content });
  };

  const handleEdit = (messageId: string, content: string) => {
    editMessage.mutate({ messageId, channelId, content });
  };

  const handleDelete = (messageId: string) => {
    deleteMessage.mutate({ messageId, channelId });
  };

  if (!channel) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Loading channel...</div>;
  }

  if (channel.type === 'voice') {
    return (
      <div className="flex flex-1 min-w-0">
        <VoiceChannel groupId={groupId} channelId={channelId} channelName={channel.name} />
        {members && <MemberList members={members} groupId={groupId} />}
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-w-0">
      <div className="flex flex-1 flex-col min-w-0">
        <ChannelHeader channel={channel} groupId={groupId} />

        {messagesLoading ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
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

        <div className="flex items-center gap-2 border-t border-border bg-card">
          <div className="flex-1">
            <MessageInput onSend={handleSend} disabled={sendMessage.isPending} />
          </div>
          <InviteButton groupId={groupId} />
        </div>
      </div>

      {/* Member list sidebar */}
      {members && <MemberList members={members} groupId={groupId} />}
    </div>
  );
}
