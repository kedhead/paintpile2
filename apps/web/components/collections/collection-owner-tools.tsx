'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Loader2, Lock, Pencil, Trash2 } from 'lucide-react';
import { useConfirm } from '../ui/confirm-dialog';
import { useToast } from '../ui/toast';
import { useDeleteCollection, useUpdateCollection } from '../../hooks/use-collections';
import { COLLECTION_NAME_MAX } from '../../lib/collections';

interface Props {
  collection: { id: string; name: string; description?: string; is_public: boolean };
  profileHref: string;
}

/** Edit / visibility / delete controls shown to a collection's owner. */
export function CollectionOwnerTools({ collection, profileHref }: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const update = useUpdateCollection();
  const remove = useDeleteCollection();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || '');

  const save = async (data: { name?: string; description?: string; is_public?: boolean }) => {
    try {
      await update.mutateAsync({ id: collection.id, data });
      setEditing(false);
      router.refresh();
    } catch {
      toast('Could not save changes', 'error');
    }
  };

  const onDelete = async () => {
    const ok = await confirm({
      title: `Delete "${collection.name}"?`,
      message: 'The projects stay where they are; only this collection goes away.',
      destructive: true,
    });
    if (!ok) return;
    await remove.mutateAsync(collection.id);
    router.push(profileHref);
  };

  if (editing) {
    return (
      <form
        onSubmit={(e) => { e.preventDefault(); if (name.trim()) save({ name: name.trim(), description: description.trim() }); }}
        className="space-y-2 rounded-xl border border-border bg-card p-4"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={COLLECTION_NAME_MAX}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="Collection name"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={2}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="What ties these projects together? (optional)"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setEditing(false)} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
          <button type="submit" disabled={update.isPending || !name.trim()} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
            {update.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Save
          </button>
        </div>
      </form>
    );
  }

  const btn = 'flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60';
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => setEditing(true)} className={btn}><Pencil className="h-3.5 w-3.5" />Edit</button>
      <button onClick={() => save({ is_public: !collection.is_public })} disabled={update.isPending} className={btn}>
        {collection.is_public ? <><Lock className="h-3.5 w-3.5" />Make private</> : <><Globe className="h-3.5 w-3.5" />Make public</>}
      </button>
      <button onClick={onDelete} disabled={remove.isPending} className={`${btn} hover:text-red-500`}><Trash2 className="h-3.5 w-3.5" />Delete</button>
    </div>
  );
}
