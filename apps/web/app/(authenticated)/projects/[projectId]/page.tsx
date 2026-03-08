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
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ProjectDetail project={project} />
    </div>
  );
}
