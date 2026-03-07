'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  initialValue?: string;
  placeholder?: string;
  isPending?: boolean;
}

export function CommentForm({
  onSubmit,
  initialValue = '',
  placeholder = 'Write a comment...',
  isPending = false,
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await onSubmit(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        maxLength={1000}
        className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm placeholder:text-gray-400 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300"
      />
      <button
        type="submit"
        disabled={!content.trim() || isPending}
        className="rounded-full p-1.5 text-primary-600 hover:bg-primary-50 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}
