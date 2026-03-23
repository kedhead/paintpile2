'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, LogIn } from 'lucide-react';
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
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-1 border-t border-border pt-2">
          {comments?.items?.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

          {user ? (
            <div className="pt-1">
              <CommentForm onSubmit={handleCreate} isPending={createComment.isPending} />
            </div>
          ) : (
            <div className="pt-2 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in to comment
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
