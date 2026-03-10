'use client';

import type { RecordModel } from 'pocketbase';
import { Check, Plus } from 'lucide-react';

interface PaintCardProps {
  paint: RecordModel;
  owned: boolean;
  onToggleOwned: () => void;
}

export function PaintCard({ paint, owned, onToggleOwned }: PaintCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      {/* Color Swatch */}
      <div
        className="h-16 w-full"
        style={{ backgroundColor: paint.hex_color || paint.color || '#888888' }}
      />

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground truncate">{paint.brand}</p>
        <h3 className="text-sm font-semibold text-foreground truncate">{paint.name}</h3>

        <div className="mt-2 flex items-center justify-between">
          {paint.type && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {paint.type}
            </span>
          )}
          <button
            onClick={onToggleOwned}
            className={`ml-auto flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              owned
                ? 'bg-primary text-white'
                : 'border border-border text-muted-foreground hover:bg-muted'
            }`}
            title={owned ? 'Remove from inventory' : 'Add to inventory'}
          >
            {owned ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
