'use client';

import { useState } from 'react';
import { Newspaper, Loader2, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';
import { useNews, useCreateNews } from '../../../../hooks/use-news';

type NewsType = 'update' | 'feature' | 'announcement' | 'maintenance';

export default function AdminNewsPage() {
  const { pb } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NewsType>('update');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { data, refetch } = useNews();
  const createNews = useCreateNews();

  const items = data?.pages.flatMap((p) => p.items) || [];

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setType('update');
    setShowForm(true);
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditingId(item.id as string);
    setTitle((item.title as string) || '');
    setContent((item.content as string) || '');
    setType((item.type as NewsType) || 'update');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await pb.collection('news').update(editingId, {
          title: title.trim(),
          content: content.trim(),
          type,
        });
      } else {
        await createNews.mutateAsync({ title: title.trim(), content: content.trim(), type });
      }
      setTitle('');
      setContent('');
      setEditingId(null);
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error('Save news error:', error);
      alert('Failed to save news post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this news post?')) return;
    setDeleting(id);
    try {
      await pb.collection('news').delete(id);
      refetch();
    } catch (error) {
      console.error('Delete news error:', error);
      alert('Failed to delete news post');
    } finally {
      setDeleting(null);
    }
  };

  const TYPE_COLORS: Record<NewsType, string> = {
    update: 'bg-blue-500/20 text-blue-400',
    feature: 'bg-green-500/20 text-green-400',
    announcement: 'bg-amber-500/20 text-amber-400',
    maintenance: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Manage News</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/80"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{editingId ? 'Edit Post' : 'New Post'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as NewsType)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="update">Update</option>
            <option value="feature">New Feature</option>
            <option value="announcement">Announcement</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <textarea
            placeholder="Content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || createNews.isPending}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {(saving || createNews.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Update' : 'Publish'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between rounded-lg border border-border bg-card p-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[item.type as NewsType] || TYPE_COLORS.update}`}>
                  {item.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.created).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
              <button
                onClick={() => openEdit(item)}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deleting === item.id}
                className="rounded p-1.5 text-muted-foreground hover:bg-red-900/30 hover:text-red-400"
              >
                {deleting === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No news posts yet</p>
        )}
      </div>
    </div>
  );
}
