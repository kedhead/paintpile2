'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { BookOpen, Plus, Search, Loader2 } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { useMyDiary } from '../../../hooks/use-diary';
import { DiaryEntryCard } from '../../../components/diary/diary-entry-card';
import { DiaryEntryForm } from '../../../components/diary/diary-entry-form';

export default function DiaryPage() {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<RecordModel | null>(null);
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useMyDiary(search, tag);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const entries = data?.pages.flatMap((p) => p.items) || [];

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleEdit = (entry: RecordModel) => {
    setEditEntry(entry);
    setShowForm(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Hobby Diary</h1>
        </div>
        <button
          onClick={() => {
            setEditEntry(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/80"
        >
          <Plus className="h-4 w-4" />
          New Entry
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {showForm && (
        <DiaryEntryForm
          editEntry={editEntry}
          onClose={() => {
            setShowForm(false);
            setEditEntry(null);
          }}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {search ? 'No entries match your search' : 'Start your hobby diary'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <DiaryEntryCard key={entry.id} entry={entry} onEdit={handleEdit} />
          ))}
          <div ref={sentinelRef} className="h-4" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
