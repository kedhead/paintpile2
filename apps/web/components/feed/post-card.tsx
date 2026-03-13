'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { Film, MoreHorizontal, Trash2 } from 'lucide-react';
import { getDisplayName } from '@paintpile/shared';
import { useAuth } from '../auth-provider';
import { UserAvatar } from '../social/user-avatar';
import { LikeButton } from '../social/like-button';
import { CommentSection } from '../social/comment-section';
import { PostMediaGrid } from './post-media-grid';
import { useDeletePost, useAdminDeletePost } from '../../hooks/use-posts';
import { relativeTime } from '../../lib/pb-helpers';

interface PostCardProps {
  post: RecordModel;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const author = post.expand?.user as RecordModel | undefined;
  const hasVideos = Array.isArray(post.videos) && post.videos.length > 0;

  const isOwner = user?.id === post.user;
  const isAdmin = user?.role === 'admin';
  const canDelete = isOwner || isAdmin;

  const deletePost = useDeletePost();
  const adminDeletePost = useAdminDeletePost();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    try {
      if (isOwner) {
        await deletePost.mutateAsync(post.id);
      } else if (isAdmin) {
        await adminDeletePost.mutateAsync(post.id);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
    setConfirmDelete(false);
    setMenuOpen(false);
  };

  const isDeleting = deletePost.isPending || adminDeletePost.isPending;

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
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-muted-foreground">{relativeTime(post.created)}</p>
            {hasVideos && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Film className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>

        {/* Overflow menu */}
        {canDelete && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-50 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                  <button
                    onClick={() => {
                      setConfirmDelete(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{post.content}</p>

      {/* Media (images + videos + text overlays) */}
      <PostMediaGrid post={post} />

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

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setConfirmDelete(false)}>
          <div
            className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-foreground">Delete Post?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isOwner
                ? 'This will permanently delete your post. This action cannot be undone.'
                : 'You are deleting this post as an admin. This action cannot be undone.'}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
