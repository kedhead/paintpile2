'use client';

import { useEffect, useRef } from 'react';
import type { RecordModel } from 'pocketbase';
import { MessageItem } from './message-item';

interface MessageListProps {
  messages: RecordModel[];
  currentUserId: string;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}

function isCompact(current: RecordModel, previous: RecordModel | undefined): boolean {
  if (!previous) return false;
  if (current.user !== previous.user) return false;
  const diff = new Date(current.created).getTime() - new Date(previous.created).getTime();
  return diff < 2 * 60 * 1000; // 2 minutes
}

export function MessageList({ messages, currentUserId, onEdit, onDelete }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
        No messages yet. Be the first to say something!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="py-4">
        {messages.map((msg, i) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isOwn={msg.user === currentUserId}
            compact={isCompact(msg, messages[i - 1])}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
