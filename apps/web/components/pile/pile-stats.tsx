'use client';

import { Boxes, AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface PileStatsData {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  completionPercent: number;
}

interface PileStatsProps {
  stats: PileStatsData | undefined;
  isLoading: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${colorClass}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export function PileStats({ stats, isLoading }: PileStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-card border border-border" />
        ))}
      </div>
    );
  }

  const data = stats || { total: 0, notStarted: 0, inProgress: 0, completed: 0, completionPercent: 0 };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={data.total} icon={Boxes} colorClass="text-primary" />
        <StatCard label="Not Started" value={data.notStarted} icon={AlertCircle} colorClass="text-muted-foreground" />
        <StatCard label="In Progress" value={data.inProgress} icon={Clock} colorClass="text-amber-400" />
        <StatCard label="Completed" value={data.completed} icon={CheckCircle} colorClass="text-emerald-400" />
      </div>

      {/* Completion bar */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Completion</span>
          <span className="font-semibold text-foreground">{data.completionPercent}%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${data.completionPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
