'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useRecolor } from '../../hooks/use-ai';

interface RecolorDialogProps {
  imageUrl: string;
  onClose: () => void;
  onResult: (resultUrl: string) => void;
}

export function RecolorDialog({ imageUrl, onClose, onResult }: RecolorDialogProps) {
  const [prompt, setPrompt] = useState('');
  const recolor = useRecolor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const result = await recolor.mutateAsync({ imageUrl, prompt: prompt.trim() });
    if (result.data?.imageUrl) {
      onResult(result.data.imageUrl);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recolor Miniature</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="mb-4 overflow-hidden rounded-lg">
          <img src={imageUrl} alt="Source" className="w-full object-cover" style={{ maxHeight: '200px' }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Color Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Change armor to deep red with gold trim"
              rows={3}
              required
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">20 credits</p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!prompt.trim() || recolor.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {recolor.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {recolor.isPending ? 'Processing...' : 'Recolor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
