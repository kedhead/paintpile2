'use client';

import type { RecordModel } from 'pocketbase';
import { Loader2 } from 'lucide-react';
import { useMyProjects, useUpdateProject } from '../../hooks/use-projects';
import { ProjectStatusBadge } from './project-status-badge';
import Link from 'next/link';

const COLUMNS = [
  { status: 'not-started', label: 'Planning', color: 'border-t-gray-500' },
  { status: 'in-progress', label: 'In Progress', color: 'border-t-blue-500' },
  { status: 'completed', label: 'Completed', color: 'border-t-green-500' },
];

export function ProjectKanban() {
  const { data, isLoading } = useMyProjects();
  const updateProject = useUpdateProject();

  const projects = data?.pages.flatMap((p) => p.items) || [];

  const moveProject = async (projectId: string, newStatus: string) => {
    await updateProject.mutateAsync({ projectId, data: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {COLUMNS.map(({ status, label, color }) => {
        const columnProjects = projects.filter((p) => (p.status || 'not-started') === status);
        return (
          <div key={status} className={`rounded-lg border border-border border-t-2 ${color} bg-card`}>
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <h3 className="text-sm font-semibold text-foreground">{label}</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {columnProjects.length}
              </span>
            </div>
            <div className="space-y-2 p-2">
              {columnProjects.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">No projects</p>
              ) : (
                columnProjects.map((project) => (
                  <KanbanCard
                    key={project.id}
                    project={project}
                    currentStatus={status}
                    onMove={moveProject}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  project,
  currentStatus,
  onMove,
}: {
  project: RecordModel;
  currentStatus: string;
  onMove: (id: string, status: string) => void;
}) {
  const otherStatuses = COLUMNS.filter((c) => c.status !== currentStatus);

  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <Link href={`/projects/${project.id}`} className="text-sm font-medium text-foreground hover:text-primary">
        {project.name}
      </Link>
      {project.tags?.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {project.tags.slice(0, 2).map((tag: string) => (
            <span key={tag} className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-2 flex gap-1">
        {otherStatuses.map(({ status, label }) => (
          <button
            key={status}
            onClick={() => onMove(project.id, status)}
            className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-primary/10 hover:text-primary"
          >
            → {label}
          </button>
        ))}
      </div>
    </div>
  );
}
