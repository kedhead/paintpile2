'use client';

import { X } from 'lucide-react';
import type { PhotoAnnotation } from '../../hooks/use-photos';

interface AnnotationPanelProps {
  annotation: PhotoAnnotation;
  onChange: (updated: PhotoAnnotation) => void;
  onDelete: () => void;
}

export function AnnotationPanel({ annotation, onChange, onDelete }: AnnotationPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Annotation ({Math.round(annotation.x)}%, {Math.round(annotation.y)}%)
        </span>
        <button onClick={onDelete} className="text-muted-foreground hover:text-red-400">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Label (e.g., 'Cloak', 'Sword')"
        value={annotation.label}
        onChange={(e) => onChange({ ...annotation, label: e.target.value })}
        className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
      />
      <textarea
        placeholder="Notes (optional)"
        value={annotation.notes || ''}
        onChange={(e) => onChange({ ...annotation, notes: e.target.value })}
        rows={2}
        className="w-full resize-none rounded border border-border bg-background px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
      />
    </div>
  );
}
