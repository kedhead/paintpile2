'use client';

import type { RecordModel } from 'pocketbase';
import { Loader2, Camera, Palette, ChefHat, Settings, PenTool, Clock, Plus } from 'lucide-react';
import { useProjectTimeline } from '../../hooks/use-timeline';
import { relativeTime } from '../../lib/pb-helpers';

interface ProjectTimelineProps {
  projectId: string;
}

const eventConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  project_created: { icon: Plus, color: 'text-blue-400', label: 'Project created' },
  project_updated: { icon: Settings, color: 'text-gray-400', label: 'Project updated' },
  photo_added: { icon: Camera, color: 'text-green-400', label: 'Photo added' },
  paint_added: { icon: Palette, color: 'text-purple-400', label: 'Paint added' },
  recipe_created: { icon: ChefHat, color: 'text-orange-400', label: 'Recipe created' },
  recipe_updated: { icon: ChefHat, color: 'text-orange-400', label: 'Recipe updated' },
  status_changed: { icon: Settings, color: 'text-amber-400', label: 'Status changed' },
  annotation_added: { icon: PenTool, color: 'text-cyan-400', label: 'Annotation added' },
};

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const { data: events = [], isLoading } = useProjectTimeline(projectId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center">
        <Clock className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Timeline events will appear here as you work on this project</p>
      </div>
    );
  }

  // Group by date
  const groups: Record<string, RecordModel[]> = {};
  events.forEach((event: RecordModel) => {
    const date = new Date(event.created).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(event);
  });

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([date, dateEvents]) => (
        <div key={date}>
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground">{date}</h4>
          <div className="relative ml-3 border-l-2 border-border pl-4 space-y-3">
            {dateEvents.map((event) => {
              const config = eventConfig[event.type] || { icon: Clock, color: 'text-muted-foreground', label: event.type };
              const Icon = config.icon;
              const metadata = typeof event.metadata === 'string'
                ? JSON.parse(event.metadata || '{}')
                : (event.metadata || {});

              return (
                <div key={event.id} className="relative flex items-start gap-2">
                  <div className={`absolute -left-[22px] rounded-full bg-card p-0.5`}>
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      {config.label}
                      {metadata.detail && (
                        <span className="text-muted-foreground"> — {metadata.detail}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{relativeTime(event.created)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
