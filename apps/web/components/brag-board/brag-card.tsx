'use client';

import type { RecordModel } from 'pocketbase';
import { Award, Star } from 'lucide-react';

interface BragCardProps {
  activity: RecordModel;
}

const gradeColors: Record<string, string> = {
  S: 'text-amber-400 border-amber-400',
  A: 'text-green-400 border-green-400',
  B: 'text-blue-400 border-blue-400',
  C: 'text-gray-400 border-gray-400',
  D: 'text-orange-400 border-orange-400',
  F: 'text-red-400 border-red-400',
};

export function BragCard({ activity }: BragCardProps) {
  const metadata = typeof activity.metadata === 'string'
    ? JSON.parse(activity.metadata || '{}')
    : (activity.metadata || {});

  const critique = metadata.critique || {};
  const userName = activity.expand?.user?.name || activity.expand?.user?.displayName || 'Painter';
  const grade = critique.grade || '?';
  const score = critique.score || 0;
  const gradeStyle = gradeColors[grade] || 'text-muted-foreground border-border';

  return (
    <div className="rounded-lg border border-border bg-card p-4" id={`brag-${activity.id}`}>
      <div className="flex items-start gap-4">
        {/* Score circle */}
        <div className={`flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-full border-2 ${gradeStyle}`}>
          <span className="text-xl font-black">{grade}</span>
          <span className="text-[10px] font-semibold">{score}/100</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{userName}</span>
            <Award className="h-3.5 w-3.5 text-amber-400" />
          </div>
          {metadata.project_name && (
            <p className="text-xs text-muted-foreground">{metadata.project_name}</p>
          )}
          {critique.analysis && (
            <p className="mt-2 text-sm italic text-muted-foreground line-clamp-3">
              &ldquo;{critique.analysis}&rdquo;
            </p>
          )}
          {critique.technical_strengths?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {critique.technical_strengths.slice(0, 3).map((s: string, i: number) => (
                <span key={i} className="flex items-center gap-0.5 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] text-green-400">
                  <Star className="h-2.5 w-2.5" />
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
