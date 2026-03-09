'use client';

import type { RecordModel } from 'pocketbase';

interface ProjectStatusChartProps {
  projects: RecordModel[];
}

const STATUS_CONFIG = [
  { key: 'not-started', label: 'Not Started', color: '#6b7280' },
  { key: 'in-progress', label: 'In Progress', color: '#3b82f6' },
  { key: 'completed', label: 'Completed', color: '#10b981' },
];

export function ProjectStatusChart({ projects }: ProjectStatusChartProps) {
  const total = projects.length;

  if (total === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Create projects to see status breakdown</p>;
  }

  return (
    <div className="space-y-3">
      {STATUS_CONFIG.map(({ key, label, color }) => {
        const count = projects.filter((p) => (p.status || 'not-started') === key).length;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground">{count} ({Math.round(pct)}%)</span>
            </div>
            <div className="h-3 rounded-full bg-muted">
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
