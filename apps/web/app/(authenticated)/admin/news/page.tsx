'use client';

import { useState } from 'react';
import { Newspaper, Loader2, Plus } from 'lucide-react';
import { useNews, useCreateNews } from '../../../../hooks/use-news';
import { NewsCard } from '../../../../components/news/news-card';

export default function AdminNewsPage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'update' | 'feature' | 'announcement' | 'maintenance'>('update');
  const { data } = useNews();
  const createNews = useCreateNews();

  const items = data?.pages.flatMap((p) => p.items) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await createNews.mutateAsync({ title: title.trim(), content: content.trim(), type });
    setTitle('');
    setContent('');
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Manage News</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/80"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-card p-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
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
              disabled={createNews.isPending}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {createNews.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publish'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
