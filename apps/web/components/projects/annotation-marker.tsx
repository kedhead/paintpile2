'use client';

import type { PhotoAnnotation } from '../../hooks/use-photos';

interface AnnotationMarkerProps {
  annotation: PhotoAnnotation;
  onClick?: () => void;
  selected?: boolean;
}

export function AnnotationMarker({ annotation, onClick, selected }: AnnotationMarkerProps) {
  return (
    <button
      onClick={onClick}
      className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-transform hover:scale-110 ${
        selected
          ? 'border-white bg-primary text-white shadow-lg'
          : 'border-white/80 bg-primary/90 text-white shadow-md'
      }`}
      style={{
        left: `${annotation.x}%`,
        top: `${annotation.y}%`,
      }}
      title={annotation.label}
    >
      {annotation.label.charAt(0).toUpperCase()}
    </button>
  );
}
