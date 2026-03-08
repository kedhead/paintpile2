'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { useAuth } from '../auth-provider';
import { useCreateArmy, useUpdateArmy } from '../../hooks/use-armies';

const POPULAR_FACTIONS = [
  'Space Marines',
  'Orks',
  'Chaos Space Marines',
  'Aeldari',
  'Necrons',
  'Tyranids',
  'Imperial Guard',
  "T'au Empire",
  'Death Guard',
  'Thousand Sons',
  'Adeptus Mechanicus',
  'Sisters of Battle',
  'Custodes',
  'Other',
] as const;

interface ArmyFormProps {
  army?: RecordModel;
  onClose: () => void;
}

export function ArmyForm({ army, onClose }: ArmyFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const createArmy = useCreateArmy();
  const updateArmy = useUpdateArmy();
  const isEdit = !!army;

  const [name, setName] = useState(army?.name || '');
  const [description, setDescription] = useState(army?.description || '');
  const [faction, setFaction] = useState(army?.faction || '');
  const [tags, setTags] = useState(army?.tags?.join(', ') || '');
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    const formData = new FormData();
    formData.append('name', name.trim());
    if (!isEdit) formData.append('user', user.id);
    if (description.trim()) formData.append('description', description.trim());
    if (faction) formData.append('faction', faction);
    if (coverPhoto) formData.append('cover_photo', coverPhoto);
    if (tags.trim()) {
      const tagList = tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      tagList.forEach((tag: string) => formData.append('tags', tag));
    }

    if (isEdit) {
      await updateArmy.mutateAsync({ armyId: army.id, data: formData });
      onClose();
    } else {
      const newArmy = await createArmy.mutateAsync(formData);
      onClose();
      router.push(`/armies/${newArmy.id}`);
    }
  };

  const isPending = createArmy.isPending || updateArmy.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? 'Edit Army' : 'New Army'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Photo */}
          <div className="flex justify-center">
            <label className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors overflow-hidden">
              {coverPhoto ? (
                <img
                  src={URL.createObjectURL(coverPhoto)}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Upload className="h-6 w-6" />
                  <span className="mt-1 text-xs">Cover Photo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Army Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ultramarines 3rd Company"
              maxLength={200}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Faction</label>
            <select
              value={faction}
              onChange={(e) => setFaction(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Select a faction...</option>
              {POPULAR_FACTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your army..."
              maxLength={1000}
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="warhammer, 40k, space marines"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">Comma separated</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {isPending ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Army')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
