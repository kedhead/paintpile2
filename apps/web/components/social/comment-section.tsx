'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useComments, useCreateComment } from '../../hooks/use-comments';
import { CommentForm } from './comment-form';
import { CommentItem } from './comment-item';
import { useAuth } from '../auth-provider';

interface CommentSectionProps {
  targetId: string;
  targetType: string;
  commentCount: number;
}

export function CommentSection({ targetId, targetType, commentCount }: CommentSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const { data: comments } = useComments(targetId, expanded);
  const createComment = useCreateComment();

  const handleCreate = async (content: string) => {
    await createComment.mutateAsync({ targetId, targetType, content });

    // Create notification for post owner (handled in step 8 if needed)
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
          {comments?.items?.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

          {user && (
            <div className="pt-1">
              <CommentForm onSubmit={handleCreate} isPending={createComment.isPending} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
