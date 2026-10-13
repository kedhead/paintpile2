'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Check, Loader2, Lock, Plus } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { LoginPrompt } from '../auth/login-prompt';
import { useToast } from '../ui/toast';
import { useCreateCollection, useMyCollections, useSavedIn, useToggleSaved } from '../../hooks/use-collections';
import { COLLECTION_NAME_MAX } from '../../lib/collections';
import { profilePath } from '../../lib/urls';

/** "Save" a project into one or more of the viewer's collections. */
export function SaveButton({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) {
    return (
      <LoginPrompt action="save projects to collections">
        {(openPrompt) => <SaveTrigger saved={false} onClick={openPrompt} />}
      </LoginPrompt>
    );
  }

  return (
    <div ref={ref} className="relative">
      <SavedTrigger projectId={projectId} onClick={() => setOpen(!open)} open={open} />
      {open && (
        <>
          {/* Phones: dim the page behind a bottom sheet; tap outside to close. */}
          <div className="fixed inset-0 z-40 bg-black/40 sm:hidden" onClick={() => setOpen(false)} aria-hidden />
          <SavePanel projectId={projectId} />
        </>
      )}
    </div>
  );
}

function SaveTrigger({ saved, onClick, open }: { saved: boolean; onClick: () => void; open?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        saved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}

function SavedTrigger({ projectId, onClick, open }: { projectId: string; onClick: () => void; open: boolean }) {
  const { data: savedIn = {} } = useSavedIn(projectId);
  return <SaveTrigger saved={Object.keys(savedIn).length > 0} onClick={onClick} open={open} />;
}

function SavePanel({ projectId }: { projectId: string }) {
  const { data: collections = [], isLoading, isError } = useMyCollections();
  const { data: savedIn = {} } = useSavedIn(projectId);
  const toggle = useToggleSaved(projectId);
  const create = useCreateCollection();
  const { toast } = useToast();
  const [name, setName] = useState('');

  const createAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const board = await create.mutateAsync({ name: trimmed });
      await toggle.mutateAsync({ collectionId: board.id });
      setName('');
      toast(`Saved to ${trimmed}`);
    } catch {
      toast('Could not create that collection', 'error');
    }
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl
        sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-8 sm:w-72 sm:rounded-xl sm:border sm:p-2 sm:shadow-xl"
    >
      <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />
      <p className="px-2 pb-1.5 pt-1 text-sm font-semibold text-foreground sm:text-xs sm:text-muted-foreground">Save to collection</p>
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
      ) : isError ? (
        <p className="px-2 py-3 text-xs text-muted-foreground">Collections aren&apos;t set up on this server yet.</p>
      ) : (
        <ul className="max-h-[50vh] overflow-y-auto sm:max-h-60">
          {collections.length === 0 && (
            <li className="px-2 py-2 text-xs text-muted-foreground">No collections yet. Create your first below.</li>
          )}
          {collections.map((c) => {
            const itemId = savedIn[c.id];
            const busy = toggle.isPending && toggle.variables?.collectionId === c.id;
            return (
              <li key={c.id}>
                <button
                  onClick={() => toggle.mutate({ collectionId: c.id, itemId })}
                  disabled={busy}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left text-base text-foreground hover:bg-muted disabled:opacity-60 sm:py-1.5 sm:text-sm"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      itemId ? 'border-primary bg-primary text-white' : 'border-border'
                    }`}
                  >
                    {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : itemId && <Check className="h-3 w-3" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  {!c.is_public && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="Private" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {!isError && (
        <form onSubmit={createAndSave} className="mt-1 flex gap-1.5 border-t border-border pt-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={COLLECTION_NAME_MAX}
            placeholder="New collection…"
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-base focus:border-primary focus:outline-none sm:px-2 sm:py-1 sm:text-sm"
          />
          <button
            type="submit"
            disabled={!name.trim() || create.isPending}
            className="flex items-center rounded-md bg-primary px-3 text-white disabled:opacity-50 sm:px-2"
            aria-label="Create collection"
          >
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </button>
        </form>
      )}
      {collections.length > 0 && <ManageLink />}
    </div>
  );
}

function ManageLink() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <Link href={`${profilePath(user)}?tab=collections`} className="mt-1 block px-2 py-1 text-xs text-primary hover:underline">
      Manage your collections
    </Link>
  );
}
