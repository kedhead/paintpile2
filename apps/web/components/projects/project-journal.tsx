'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { BookOpen, Loader2, Plus } from 'lucide-react';
import { useMyDiary } from '../../hooks/use-diary';
import { DiaryEntryCard } from '../diary/diary-entry-card';
import { DiaryEntryForm } from '../diary/diary-entry-form';

/** A project's build journal: the owner's notes linked to this project. Private. */
export function ProjectJournal({ projectId }: { projectId: string }) {
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useMyDiary(undefined, undefined, projectId);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<RecordModel | null>(null);
  const entries = data?.pages.flatMap((p) => p.items) || [];

  const closeForm = () => {
    setShowForm(false);
    setEditEntry(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Only you can see your journal.</p>
        {!showForm && (
          <button
            onClick={() => { setEditEntry(null); setShowForm(true); }}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/85"
          >
            <Plus className="h-3.5 w-3.5" />
            Add note
          </button>
        )}
      </div>

      {showForm && <DiaryEntryForm projectId={projectId} editEntry={editEntry} onClose={closeForm} />}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <BookOpen className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {isError
              ? 'The journal isn’t set up on this server yet.'
              : 'No journal entries yet. Log what you tried, what worked, and what you’d change.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <DiaryEntryCard
              key={entry.id}
              entry={entry}
              hideProject
              onEdit={(e) => { setEditEntry(e); setShowForm(true); }}
            />
          ))}
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              {isFetchingNextPage ? 'Loading…' : 'Load older entries'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
