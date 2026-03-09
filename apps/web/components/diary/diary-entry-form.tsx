'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { Plus, X, Loader2 } from 'lucide-react';
import { useCreateDiaryEntry, useUpdateDiaryEntry } from '../../hooks/use-diary';

interface DiaryEntryFormProps {
  editEntry?: RecordModel | null;
  onClose: () => void;
}

export function DiaryEntryForm({ editEntry, onClose }: DiaryEntryFormProps) {
  const isEdit = !!editEntry;
  const existingLinks = editEntry
    ? (typeof editEntry.links === 'string' ? JSON.parse(editEntry.links || '[]') : (editEntry.links || []))
    : [];
  const existingTags = editEntry
    ? (typeof editEntry.tags === 'string' ? JSON.parse(editEntry.tags || '[]') : (editEntry.tags || []))
    : [];

  const [title, setTitle] = useState(editEntry?.title || '');
  const [content, setContent] = useState(editEntry?.content || '');
  const [links, setLinks] = useState<{ label: string; url: string }[]>(existingLinks);
  const [tags, setTags] = useState<string[]>(existingTags);
  const [tagInput, setTagInput] = useState('');

  const createEntry = useCreateDiaryEntry();
  const updateEntry = useUpdateDiaryEntry();
  const isPending = createEntry.isPending || updateEntry.isPending;

  const addLink = () => setLinks([...links, { label: '', url: '' }]);
  const removeLink = (i: number) => setLinks(links.filter((_, idx) => idx !== i));
  const updateLink = (i: number, field: 'label' | 'url', value: string) => {
    setLinks(links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const data = {
      title: title.trim(),
      content: content.trim(),
      links: links.filter((l) => l.url.trim()),
      tags,
    };

    if (isEdit) {
      await updateEntry.mutateAsync({ entryId: editEntry!.id, data });
    } else {
      await createEntry.mutateAsync(data);
    }
    onClose();
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        {isEdit ? 'Edit Entry' : 'New Diary Entry'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          required
        />
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={5000}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          required
        />

        {/* Links */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Links</span>
            <button type="button" onClick={addLink} className="text-xs text-primary hover:underline">
              <Plus className="mr-0.5 inline h-3 w-3" />
              Add link
            </button>
          </div>
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder="Label"
                value={link.label}
                onChange={(e) => updateLink(i, 'label', e.target.value)}
                className="w-1/3 rounded border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
              />
              <input
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => updateLink(i, 'url', e.target.value)}
                className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
              />
              <button type="button" onClick={() => removeLink(i)} className="text-muted-foreground hover:text-red-400">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Tags</span>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
              >
                {tag}
                <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="w-20 rounded border-none bg-transparent px-1 py-0.5 text-xs text-foreground outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !title.trim() || !content.trim()}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
