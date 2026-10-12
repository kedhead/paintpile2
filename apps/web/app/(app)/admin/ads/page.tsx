'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../../components/auth-provider';
import { getFileUrl } from '../../../../lib/pb-helpers';

interface AdForm {
  title: string;
  link_url: string;
  label: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  placement: string;
  priority: number;
  image?: File;
}

const emptyForm: AdForm = {
  title: '',
  link_url: '',
  label: 'Sponsored',
  is_active: true,
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  placement: 'feed',
  priority: 0,
};

export default function AdminAdsPage() {
  const { pb } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null); // ad ID or 'new'
  const [form, setForm] = useState<AdForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['admin', 'ads'],
    queryFn: () => pb.collection('ads').getFullList({ sort: '-priority,-created' }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('link_url', form.link_url);
      formData.append('label', form.label);
      formData.append('is_active', String(form.is_active));
      formData.append('start_date', form.start_date);
      formData.append('end_date', form.end_date);
      formData.append('placement', form.placement);
      formData.append('priority', String(form.priority));
      if (imageFile) formData.append('image', imageFile);

      if (editing === 'new') {
        await pb.collection('ads').create(formData);
      } else if (editing) {
        await pb.collection('ads').update(editing, formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      setEditing(null);
      setImageFile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pb.collection('ads').delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });

  function startEdit(ad: Record<string, unknown>) {
    setForm({
      title: (ad.title as string) || '',
      link_url: (ad.link_url as string) || '',
      label: (ad.label as string) || 'Sponsored',
      is_active: ad.is_active as boolean,
      start_date: ((ad.start_date as string) || '').slice(0, 10),
      end_date: ((ad.end_date as string) || '').slice(0, 10),
      placement: (ad.placement as string) || 'feed',
      priority: (ad.priority as number) || 0,
    });
    setEditing(ad.id as string);
    setImageFile(null);
  }

  function startNew() {
    setForm(emptyForm);
    setEditing('new');
    setImageFile(null);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Manage Ads</h1>
        </div>
        {!editing && (
          <button
            onClick={startNew}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            New Ad
          </button>
        )}
      </div>

      {/* Edit / Create form */}
      {editing && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            {editing === 'new' ? 'Create Ad' : 'Edit Ad'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ad title (internal)"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Link URL</label>
              <input
                type="url"
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Label</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Sponsored"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Placement</label>
              <select
                value={form.placement}
                onChange={(e) => setForm({ ...form, placement: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="feed">Feed</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Priority</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-foreground">Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="text-sm text-muted-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { setEditing(null); setImageFile(null); }}
              className="flex items-center gap-1 rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.title}
              className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save
            </button>
          </div>
        </div>
      )}

      {/* Ad list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : ads.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No ads yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <div key={ad.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
              {ad.image && (
                <img
                  src={getFileUrl(ad, ad.image)}
                  alt={ad.title}
                  className="h-16 w-24 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{ad.title}</p>
                <p className="text-xs text-muted-foreground truncate">{ad.link_url}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    ad.is_active ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'
                  }`}>
                    {ad.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{ad.placement}</span>
                  <span className="text-[10px] text-muted-foreground">P:{ad.priority}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(ad)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this ad?')) deleteMutation.mutate(ad.id);
                  }}
                  disabled={deleteMutation.isPending}
                  className="rounded-md p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
