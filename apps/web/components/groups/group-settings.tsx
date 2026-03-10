'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Upload, Globe, Lock } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { useUpdateGroup, useDeleteGroup } from '../../hooks/use-groups';
import { getFileUrl } from '../../lib/pb-helpers';

interface GroupSettingsProps {
  group: RecordModel;
}

export function GroupSettings({ group }: GroupSettingsProps) {
  const router = useRouter();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [icon, setIcon] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(group.is_public !== false);
  const [showDelete, setShowDelete] = useState(false);

  const iconUrl = group.icon ? getFileUrl(group, group.icon) : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('is_public', String(isPublic));
    if (icon) formData.append('icon', icon);

    await updateGroup.mutateAsync({ groupId: group.id, data: formData });
  };

  const handleDelete = async () => {
    await deleteGroup.mutateAsync(group.id);
    router.push('/groups');
  };

  return (
    <div className="mx-auto max-w-lg p-6">
      <button
        onClick={() => router.push(`/groups/${group.id}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to group
      </button>

      <h1 className="text-xl font-bold text-foreground mb-6">Group Settings</h1>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Icon */}
        <div className="flex items-center gap-4">
          <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-border hover:border-primary-400 overflow-hidden">
            {icon ? (
              <img src={URL.createObjectURL(icon)} alt="" className="h-full w-full object-cover" />
            ) : iconUrl ? (
              <img src={iconUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setIcon(e.target.files?.[0] || null)}
            />
          </label>
          <span className="text-sm text-muted-foreground">Click to change icon</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            maxLength={500}
            rows={3}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {/* Visibility */}
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

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Invite Code</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-3 py-2 text-sm text-foreground">
              {group.invite_code || 'None'}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(
                `${window.location.origin}/groups/join/${group.invite_code}`
              )}
              className="rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary/10"
            >
              Copy Link
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateGroup.isPending}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/80 disabled:opacity-50"
        >
          {updateGroup.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Danger zone */}
      <div className="mt-8 rounded-lg border border-red-200 p-4">
        <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
        {showDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Are you sure?</span>
            <button
              onClick={handleDelete}
              disabled={deleteGroup.isPending}
              className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteGroup.isPending ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="rounded px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            Delete this group
          </button>
        )}
      </div>
    </div>
  );
}
