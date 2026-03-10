'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, Globe, Lock } from 'lucide-react';
import { useCreateGroup } from '../../hooks/use-groups';

interface CreateGroupDialogProps {
  onClose: () => void;
}

export function CreateGroupDialog({ onClose }: CreateGroupDialogProps) {
  const router = useRouter();
  const createGroup = useCreateGroup();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const group = await createGroup.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      icon: icon || undefined,
      isPublic,
    });

    onClose();
    router.push(`/groups/${group.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Create a Group</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon upload */}
          <div className="flex justify-center">
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-border hover:border-primary-400 transition-colors overflow-hidden">
              {icon ? (
                <img
                  src={URL.createObjectURL(icon)}
                  alt="Icon preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setIcon(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Group"
              maxLength={100}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* Public/Private toggle */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Visibility</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                  isPublic ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <Globe className={`h-4 w-4 ${isPublic ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">Public</p>
                  <p className="text-xs text-muted-foreground">Anyone can find and join</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                  !isPublic ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <Lock className={`h-4 w-4 ${!isPublic ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">Private</p>
                  <p className="text-xs text-muted-foreground">Invite only</p>
                </div>
              </button>
            </div>
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
              disabled={!name.trim() || createGroup.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {createGroup.isPending ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
