'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { Heart, MessageCircle } from 'lucide-react';
import { UserAvatar } from '../social/user-avatar';
import { getFileUrl } from '../../lib/pb-helpers';
import { profilePath, projectPath } from '../../lib/urls';

export function GalleryCard({ project, showAuthor = true }: { project: RecordModel; showAuthor?: boolean }) {
  const author = project.expand?.user as RecordModel | undefined;
  const cover = project.cover_photo ? getFileUrl(project, project.cover_photo, '600x600') : null;

  return (
    <article className="group">
      <Link
        href={projectPath(project)}
        className="relative block aspect-square overflow-hidden rounded-xl bg-muted"
      >
        {cover && (
          <img
            src={cover}
            alt={project.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="line-clamp-1 text-sm font-semibold text-white">{project.name}</p>
        </div>
      </Link>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        {showAuthor && author ? (
          <Link href={profilePath(author)} className="flex min-w-0 items-center gap-1.5 hover:text-foreground">
            <UserAvatar user={author} size="xs" />
            <span className="truncate font-medium text-foreground">{author.username || author.name}</span>
          </Link>
        ) : (
          <span className="truncate font-medium text-foreground">{project.name}</span>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-2.5">
          <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{project.like_count || 0}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{project.comment_count || 0}</span>
        </span>
      </div>
    </article>
  );
}
