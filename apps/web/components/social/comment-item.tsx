'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { UserAvatar } from './user-avatar';
import { useAuth } from '../auth-provider';
import { useEditComment, useDeleteComment } from '../../hooks/use-comments';
import { relativeTime } from '../../lib/pb-helpers';

interface CommentItemProps {
  comment: RecordModel;
}

export function CommentItem({ comment }: CommentItemProps) {
  const { user } = useAuth();
  const editComment = useEditComment();
  const deleteComment = useDeleteComment();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const author = comment.expand?.user as RecordModel | undefined;
  const isOwn = user?.id === comment.user;

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    await editComment.mutateAsync({ commentId: comment.id, content: editContent.trim() });
    setEditing(false);
  };

  return (
    <div className="flex gap-2 py-2">
      {author && (
        <Link href={`/profile/${author.id}`} className="shrink-0">
          <UserAvatar user={author} size="sm" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          {author && (
            <Link href={`/profile/${author.id}`} className="text-xs font-medium text-foreground hover:underline">
              {author.name || author.displayName || 'Painter'}
            </Link>
          )}
          <span className="text-xs text-muted-foreground">{relativeTime(comment.created)}</span>
          {comment.edited && <span className="text-xs text-muted-foreground">(edited)</span>}
        </div>

        {editing ? (
          <div className="mt-1 flex items-center gap-1">
            <input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 rounded border border-border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-300"
            />
            <button onClick={handleSaveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setEditing(false)} className="p-1 text-muted-foreground hover:bg-muted rounded">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-sm text-foreground">{comment.content}</p>
        )}
      </div>

      {isOwn && !editing && (
        <div className="flex shrink-0 gap-0.5">
          <button
            onClick={() => { setEditContent(comment.content); setEditing(true); }}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={() => deleteComment.mutate(comment.id)}
            className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
