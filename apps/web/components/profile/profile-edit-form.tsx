'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileInput } from '@paintpile/shared';
import { Settings, X } from 'lucide-react';
import { useAuth } from '../auth-provider';

export function ProfileEditForm({ onClose }: { onClose: () => void }) {
  const { pb, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.name || '',
      username: user?.username || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      await pb.collection('users').update(user.id, {
        name: data.displayName,
        username: data.username,
        bio: data.bio,
      });
      // Refresh auth to get updated user data
      await pb.collection('users').authRefresh();
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      if (message.includes('unique')) {
        setError('That username is already taken. Try another one.');
      } else {
        setError(message);
      }
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">Edit Profile</h2>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-900/30 p-3 text-sm text-red-400">{error}</div>
          )}

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-foreground">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              {...register('displayName')}
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-red-400">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground">
              Username
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                @
              </span>
              <input
                id="username"
                type="text"
                {...register('username')}
                placeholder="my_username"
                className="block w-full rounded-md border border-border bg-background pl-7 pr-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Lowercase letters, numbers, and underscores only
            </p>
            {errors.username && (
              <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-foreground">
              Bio
            </label>
            <textarea
              id="bio"
              {...register('bio')}
              rows={3}
              placeholder="Tell us about your painting journey..."
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
            {errors.bio && (
              <p className="mt-1 text-xs text-red-400">{errors.bio.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
