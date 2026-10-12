'use client';

import Link from 'next/link';
import { Eye, Loader2 } from 'lucide-react';
import { useProject } from '../../hooks/use-projects';
import { ProjectDetail } from './project-detail';

/** The owner's editable view of a project (photos, paints, recipes, AI tools). */
export function ProjectWorkshopView({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {project.is_public && (
        <Link
          href={`/projects/${project.id}?view=public`}
          className="mb-3 flex items-center justify-end gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <Eye className="h-4 w-4" />
          View public page
        </Link>
      )}
      <ProjectDetail project={project} />
    </div>
  );
}
