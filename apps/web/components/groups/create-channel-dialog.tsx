'use client';

import { useState } from 'react';
import { X, Hash, Volume2 } from 'lucide-react';
import { useCreateChannel } from '../../hooks/use-group-channels';

interface CreateChannelDialogProps {
  groupId: string;
  onClose: () => void;
}

export function CreateChannelDialog({ groupId, onClose }: CreateChannelDialogProps) {
  const createChannel = useCreateChannel();
  const [name, setName] = useState('');
  const [type, setType] = useState<'text' | 'voice'>('text');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createChannel.mutateAsync({
      groupId,
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      type,
      category: category.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-lg bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Create Channel</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Channel Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('text')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  type === 'text'
                    ? 'border-primary-500 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-background'
                }`}
              >
                <Hash className="h-4 w-4" />
                Text
              </button>
              <button
                type="button"
                onClick={() => setType('voice')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  type === 'voice'
                    ? 'border-primary-500 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-background'
                }`}
              >
                <Volume2 className="h-4 w-4" />
                Voice
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Channel Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'text' ? 'general' : 'voice-chat'}
              maxLength={100}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Category <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Text Channels"
              maxLength={100}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
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
              disabled={!name.trim() || createChannel.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/80 disabled:opacity-50"
            >
              {createChannel.isPending ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
