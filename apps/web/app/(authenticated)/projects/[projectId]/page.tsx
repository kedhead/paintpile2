'use client';

import { use } from 'react';
import { Loader2 } from 'lucide-react';
import { useProject } from '../../../../hooks/use-projects';
import { ProjectDetail } from '../../../../components/projects/project-detail';

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
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
      <ProjectDetail project={project} />
    </div>
  );
}
