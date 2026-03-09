'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { Palette, Plus, Trash2, Loader2 } from 'lucide-react';
import { useProjectPaints, useAddProjectPaint, useRemoveProjectPaint } from '../../hooks/use-project-paints';

interface ProjectPaintLibraryProps {
  projectId: string;
  isOwner: boolean;
}

export function ProjectPaintLibrary({ projectId, isOwner }: ProjectPaintLibraryProps) {
  const { data: paints = [], isLoading } = useProjectPaints(projectId);
  const addPaint = useAddProjectPaint();
  const removePaint = useRemoveProjectPaint();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isOwner && (
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Add paint to project
        </button>
      )}

      {paints.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center">
          <Palette className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {isOwner ? 'Track paints used in this project' : 'No paints tracked yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {paints.map((pp: RecordModel) => {
            const paint = pp.expand?.paint;
            return (
              <div key={pp.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
                {paint?.hex_color && (
                  <div
                    className="h-6 w-6 rounded-full border border-border"
                    style={{ backgroundColor: paint.hex_color }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{paint?.name || 'Unknown paint'}</p>
                  <p className="text-xs text-muted-foreground">{paint?.brand || ''}</p>
                  {pp.notes && <p className="mt-0.5 text-xs text-muted-foreground">{pp.notes}</p>}
                </div>
                {isOwner && (
                  <button
                    onClick={() => removePaint.mutate({ id: pp.id, projectId })}
                    className="text-muted-foreground hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
