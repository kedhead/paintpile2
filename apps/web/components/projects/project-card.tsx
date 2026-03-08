'use client';

import Link from 'next/link';
import type { RecordModel } from 'pocketbase';
import { Image as ImageIcon, Palette } from 'lucide-react';
import { ProjectStatusBadge } from './project-status-badge';
import { getFileUrl } from '../../lib/pb-helpers';
import { relativeTime } from '../../lib/pb-helpers';

interface ProjectCardProps {
  project: RecordModel;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const coverPhoto = project.cover_photo
    ? getFileUrl(project, project.cover_photo, '400x300')
    : null;

  return (
    <Link href={`/projects/${project.id}`}>
      <article className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
        {/* Cover Photo */}
        <div className="aspect-[4/3] bg-gray-100">
          {coverPhoto ? (
            <img
              src={coverPhoto}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Palette className="h-10 w-10 text-gray-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 line-clamp-1">
              {project.name}
            </h3>
            <ProjectStatusBadge status={project.status || 'not-started'} />
          </div>

          {project.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{project.description}</p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
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

          {/* Tags */}
          {project.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
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
