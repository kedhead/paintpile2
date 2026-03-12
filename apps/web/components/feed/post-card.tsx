'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { getDisplayName } from '@paintpile/shared';
import { UserAvatar } from '../social/user-avatar';
import { LikeButton } from '../social/like-button';
import { CommentSection } from '../social/comment-section';
import { PostImageGrid } from './post-image-grid';
import { relativeTime } from '../../lib/pb-helpers';

interface PostCardProps {
  post: RecordModel;
}

export function PostCard({ post }: PostCardProps) {
  const author = post.expand?.user as RecordModel | undefined;

  return (
    <article className="rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {author && (
          <Link href={`/profile/${author.id}`}>
            <UserAvatar user={author} size="md" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          {author && (
            <Link
              href={`/profile/${author.id}`}
              className="text-sm font-medium text-foreground hover:underline"
            >
              {getDisplayName(author)}
            </Link>
          )}
          <p className="text-xs text-muted-foreground">{relativeTime(post.created)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{post.content}</p>

      {/* Images */}
      <PostImageGrid post={post} />

      {/* Tags */}
      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {post.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
        <LikeButton targetId={post.id} targetType="post" initialCount={post.like_count || 0} />
      </div>

      {/* Comments */}
      <CommentSection targetId={post.id} targetType="post" commentCount={post.comment_count || 0} />
    </article>
  );
}
