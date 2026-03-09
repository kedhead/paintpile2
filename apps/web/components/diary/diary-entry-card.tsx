'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { Edit2, Trash2, ExternalLink, Tag } from 'lucide-react';
import { relativeTime } from '../../lib/pb-helpers';
import { useDeleteDiaryEntry } from '../../hooks/use-diary';

interface DiaryEntryCardProps {
  entry: RecordModel;
  onEdit: (entry: RecordModel) => void;
}

export function DiaryEntryCard({ entry, onEdit }: DiaryEntryCardProps) {
  const deleteEntry = useDeleteDiaryEntry();
  const [expanded, setExpanded] = useState(false);

  const links = typeof entry.links === 'string' ? JSON.parse(entry.links || '[]') : (entry.links || []);
  const tags = typeof entry.tags === 'string' ? JSON.parse(entry.tags || '[]') : (entry.tags || []);

  const handleDelete = async () => {
    if (!confirm('Delete this diary entry?')) return;
    await deleteEntry.mutateAsync(entry.id);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground">{entry.title}</h3>
          <p className="text-xs text-muted-foreground">{relativeTime(entry.created)}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(entry)}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="rounded p-1.5 text-muted-foreground hover:bg-red-900/30 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p
        className={`mt-2 whitespace-pre-wrap text-sm text-foreground ${!expanded ? 'line-clamp-3' : ''}`}
      >
        {entry.content}
      </p>
      {entry.content?.length > 200 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs text-primary hover:underline"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((link: { label: string; url: string }, i: number) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {link.label || link.url}
            </a>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((tag: string) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
