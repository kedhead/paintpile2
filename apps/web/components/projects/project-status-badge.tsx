'use client';

const STATUS_STYLES = {
  'not-started': 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
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
