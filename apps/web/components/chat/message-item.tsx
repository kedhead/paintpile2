'use client';

import { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { UserAvatar } from '../social/user-avatar';
import { relativeTime } from '../../lib/pb-helpers';

interface MessageItemProps {
  message: RecordModel;
  isOwn: boolean;
  compact: boolean;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}

export function MessageItem({ message, isOwn, compact, onEdit, onDelete }: MessageItemProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const user = message.expand?.user as RecordModel | undefined;
  const displayName = user?.name || user?.displayName || 'Unknown';

  const handleSaveEdit = () => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit(message.id, trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      setEditing(false);
      setEditContent(message.content);
    }
  };

  return (
    <div className={`group flex gap-3 px-4 hover:bg-background ${compact ? 'py-0.5' : 'py-2'}`}>
      {compact ? (
        <div className="w-8 flex-shrink-0" />
      ) : (
        <div className="flex-shrink-0 pt-0.5">
          {user && <UserAvatar user={user} size="sm" />}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {!compact && (
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground">{relativeTime(message.created)}</span>
          </div>
        )}

        {editing ? (
          <div className="flex items-end gap-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
              rows={1}
              autoFocus
            />
            <button onClick={handleSaveEdit} className="p-1 text-green-400 hover:text-green-400">
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setEditContent(message.content);
              }}
              className="p-1 text-muted-foreground hover:text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
            {message.content}
            {message.edited && (
              <span className="ml-1 text-xs text-muted-foreground">(edited)</span>
            )}
          </p>
        )}
      </div>

      {isOwn && !editing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="p-1 text-muted-foreground hover:text-muted-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(message.id)}
            className="p-1 text-muted-foreground hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
