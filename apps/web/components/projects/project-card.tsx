'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { Image as ImageIcon, Palette } from 'lucide-react';
import { ProjectStatusBadge } from './project-status-badge';
import { UserAvatar } from '../social/user-avatar';
import { getFileUrl, relativeTime } from '../../lib/pb-helpers';

interface ProjectCardProps {
  project: RecordModel;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const coverPhoto = project.cover_photo
    ? getFileUrl(project, project.cover_photo, '400x300')
    : null;

  return (
    <Link href={`/projects/${project.id}`}>
      <article className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
        {/* Cover Photo */}
        <div className="aspect-[4/3] bg-muted">
          {coverPhoto ? (
            <img
              src={coverPhoto}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Palette className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary line-clamp-1">
              {project.name}
            </h3>
            <ProjectStatusBadge status={project.status || 'not-started'} />
          </div>

          {project.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{project.description}</p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              {project.photo_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              {project.paint_count || 0}
            </span>
            <span className="ml-auto">{relativeTime(project.created)}</span>
          </div>

          {/* Author */}
          {project.expand?.user && (
            <Link
              href={`/profile/${project.expand.user.id}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-2 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <UserAvatar user={project.expand.user} size="sm" className="!h-5 !w-5 !text-[10px]" />
              <span className="truncate">{project.expand.user.display_name || project.expand.user.username || 'User'}</span>
            </Link>
          )}

          {/* Tags */}
          {Array.isArray(project.tags) && project.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
