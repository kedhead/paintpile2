'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { Package, ChevronDown, Trash2 } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  'not-started': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-amber-900/40 text-amber-400',
  completed: 'bg-emerald-900/40 text-emerald-400',
};

const STATUS_LABELS: Record<string, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

const ALL_STATUSES = ['not-started', 'in-progress', 'completed'] as const;

interface PileItemCardProps {
  item: RecordModel;
  onStatusChange: (projectId: string, status: string) => void;
  onDelete: (projectId: string) => void;
}

export function PileItemCard({ item, onStatusChange, onDelete }: PileItemCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const status = item.status || 'not-started';

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Package className="h-5 w-5 shrink-0 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground truncate">{item.name}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.quantity > 1 && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              x{item.quantity}
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] || STATUS_STYLES['not-started']}`}
          >
            {STATUS_LABELS[status] || status}
          </span>
        </div>
      </div>

      {item.description && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            Change Status
            <ChevronDown className="h-3 w-3" />
          </button>
          {showStatusMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-36 rounded-md border border-border bg-card py-1 shadow-lg">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onStatusChange(item.id, s);
                      setShowStatusMenu(false);
                    }}
                    className={`block w-full px-3 py-1.5 text-left text-xs transition-colors ${
                      s === status
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(item.id)}
          className="rounded-md p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
          title="Delete item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
