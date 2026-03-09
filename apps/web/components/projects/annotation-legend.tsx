'use client';

import type { PhotoAnnotation } from '../../hooks/use-photos';

interface AnnotationLegendProps {
  annotations: PhotoAnnotation[];
}

export function AnnotationLegend({ annotations }: AnnotationLegendProps) {
  if (annotations.length === 0) return null;

  return (
    <div className="rounded-lg bg-black/60 p-3 backdrop-blur-sm">
      <h4 className="mb-1.5 text-xs font-semibold text-white/80">Annotations</h4>
      <div className="space-y-1">
        {annotations.map((ann, i) => (
          <div key={ann.id} className="flex items-start gap-2">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {i + 1}
            </span>
            <div>
              <p className="text-xs font-medium text-white">{ann.label}</p>
              {ann.notes && <p className="text-[10px] text-white/60">{ann.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
