'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { useCreateProject } from '../../hooks/use-projects';

interface CreateProjectDialogProps {
  onClose: () => void;
}

export function CreateProjectDialog({ onClose }: CreateProjectDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const createProject = useCreateProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('not-started');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('user', user.id);
    formData.append('status', status);
    formData.append('is_public', String(isPublic));
    if (description.trim()) formData.append('description', description.trim());
    if (coverPhoto) formData.append('cover_photo', coverPhoto);
    if (tags.trim()) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      tagList.forEach((tag) => formData.append('tags', tag));
    }

    const project = await createProject.mutateAsync(formData);
    onClose();
    router.push(`/projects/${project.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Photo */}
          <div className="flex justify-center">
            <label className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors overflow-hidden">
              {coverPhoto ? (
                <img
                  src={URL.createObjectURL(coverPhoto)}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Space Marines Kill Team"
              maxLength={200}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you painting?"
              maxLength={1000}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="warhammer, space marines, kill team"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">Comma separated</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-gray-300"
            />
            Public project
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || createProject.isPending}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {createProject.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
