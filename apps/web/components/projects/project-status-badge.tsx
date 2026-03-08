'use client';

const STATUS_STYLES = {
  'not-started': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-blue-900/30 text-blue-400',
  completed: 'bg-green-900/30 text-green-400',
} as const;

const STATUS_LABELS = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed',
} as const;

type ProjectStatus = keyof typeof STATUS_STYLES;

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] || STATUS_STYLES['not-started']}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
