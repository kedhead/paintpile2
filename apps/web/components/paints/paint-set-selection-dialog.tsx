'use client';

import { useState } from 'react';
import { X, Package, Check, Loader2 } from 'lucide-react';
import { CURATED_PAINT_SETS, type CuratedPaintSet } from '../../lib/curated-paint-sets';

interface PaintSetSelectionDialogProps {
  onClose: () => void;
  onBulkAdd: (paintNames: string[]) => Promise<void>;
}

export function PaintSetSelectionDialog({ onClose, onBulkAdd }: PaintSetSelectionDialogProps) {
  const [selectedSet, setSelectedSet] = useState<CuratedPaintSet | null>(null);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!selectedSet) return;
    setAdding(true);
    try {
      await onBulkAdd(selectedSet.paintNames);
      onClose();
    } catch (error) {
      console.error('Bulk add failed:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-semibold text-foreground">Add Paint Set</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {CURATED_PAINT_SETS.map((set) => (
            <button
              key={set.setName}
              onClick={() => setSelectedSet(set)}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                selectedSet?.setName === set.setName
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{set.setName}</span>
                {selectedSet?.setName === set.setName && <Check className="ml-auto h-4 w-4 text-primary" />}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{set.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">{set.paintNames.length} paints &middot; {set.brand}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedSet || adding}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
            Add {selectedSet?.paintNames.length || 0} Paints
          </button>
        </div>
      </div>
    </div>
  );
}
