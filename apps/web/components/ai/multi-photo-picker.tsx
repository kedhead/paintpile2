'use client';

import type { RecordModel } from 'pocketbase';
import { Check } from 'lucide-react';
import { getFileUrl } from '../../lib/pb-helpers';

interface MultiPhotoPickerProps {
  photos: RecordModel[];
  selected: string[];
  onToggle: (photoId: string) => void;
  maxSelection?: number;
}

export function MultiPhotoPicker({ photos, selected, onToggle, maxSelection = 4 }: MultiPhotoPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Select up to {maxSelection} photos ({selected.length}/{maxSelection} selected)
      </p>
      <div className="grid grid-cols-4 gap-2">
        {photos.map((photo) => {
          const isSelected = selected.includes(photo.id);
          const isDisabled = !isSelected && selected.length >= maxSelection;
          return (
            <button
              key={photo.id}
              onClick={() => !isDisabled && onToggle(photo.id)}
              disabled={isDisabled}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/30'
                  : isDisabled
                    ? 'border-border opacity-40'
                    : 'border-border hover:border-muted-foreground'
              }`}
            >
              <img
                src={getFileUrl(photo, photo.file, '150x150')}
                alt={photo.caption || 'Photo'}
                className="h-full w-full object-cover"
              />
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                  <Check className="h-6 w-6 text-white drop-shadow-md" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
