'use client';

import { useState, useRef } from 'react';
import {
  Send, Image, X, Loader2, Check, AlertCircle,
  Twitter, Globe, Clock,
} from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';

interface PostResult {
  success: boolean;
  platforms: string[];
  error?: string;
}

const PLATFORMS = [
  { id: 'x', label: 'X (Twitter)', icon: Twitter, color: 'text-foreground' },
  { id: 'bluesky', label: 'Bluesky', icon: Globe, color: 'text-blue-400' },
] as const;

const CHARACTER_LIMITS: Record<string, number> = {
  x: 280,
  bluesky: 300,
};

export default function SocialPostingPage() {
  const { pb } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['x', 'bluesky']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState<PostResult | null>(null);
  const [history, setHistory] = useState<Array<{ message: string; platforms: string[]; time: string; success: boolean }>>([]);

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const activeLimit = Math.min(
    ...platforms.map((p) => CHARACTER_LIMITS[p] || 300)
  );

  const handlePost = async () => {
    if (!message.trim() || !platforms.length) return;
    setPosting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('message', message.trim());
      formData.append('platforms', JSON.stringify(platforms));
      if (imageFile) formData.append('image', imageFile);
      if (scheduledAt) formData.append('scheduledAt', scheduledAt);

      const res = await fetch('/api/admin/post-to-social', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pb.authStore.token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, platforms });
        setHistory((prev) => [
          { message: message.trim(), platforms: [...platforms], time: new Date().toLocaleTimeString(), success: true },
          ...prev,
        ]);
        // Reset form
        setMessage('');
        removeImage();
        setScheduledAt('');
      } else {
        setResult({ success: false, platforms, error: data.error });
        setHistory((prev) => [
          { message: message.trim(), platforms: [...platforms], time: new Date().toLocaleTimeString(), success: false },
          ...prev,
        ]);
      }
    } catch (err) {
      setResult({
        success: false,
        platforms,
        error: err instanceof Error ? err.message : 'Network error',
      });
    }

    setPosting(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Social Media Posting</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Post to X and Bluesky simultaneously via n8n
        </p>
      </div>

      {/* Compose */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        {/* Platform toggles */}
        <div className="flex gap-2">
          {PLATFORMS.map(({ id, label, icon: Icon, color }) => {
            const active = platforms.includes(id);
            return (
              <button
                key={id}
                onClick={() => togglePlatform(id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-primary' : color}`} />
                {label}
                {active && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>

        {/* Message */}
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={activeLimit}
            placeholder="What's happening with PaintPile?"
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <div className="mt-1 flex items-center justify-between">
            <span className={`text-xs ${message.length > activeLimit * 0.9 ? 'text-red-400' : 'text-muted-foreground'}`}>
              {message.length}/{activeLimit}
            </span>
            {platforms.length > 1 && (
              <span className="text-xs text-muted-foreground">
                Limit based on {activeLimit === 280 ? 'X' : 'Bluesky'} ({activeLimit} chars)
              </span>
            )}
          </div>
        </div>

        {/* Image */}
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Upload preview"
              className="max-h-48 rounded-lg border border-border object-cover"
            />
            <button
              onClick={removeImage}
              className="absolute -right-2 -top-2 rounded-full bg-card border border-border p-1 text-muted-foreground hover:text-foreground shadow-sm"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
          >
            <Image className="h-4 w-4" />
            Add image
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleImageChange}
        />

        {/* Schedule (optional) */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
          {scheduledAt && (
            <button
              onClick={() => setScheduledAt('')}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear (post now)
            </button>
          )}
          {!scheduledAt && (
            <span className="text-xs text-muted-foreground">Optional — leave empty to post immediately</span>
          )}
        </div>

        {/* Post button */}
        <button
          onClick={handlePost}
          disabled={posting || !message.trim() || !platforms.length}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
        >
          {posting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {scheduledAt ? 'Schedule Post' : `Post to ${platforms.length} platform${platforms.length > 1 ? 's' : ''}`}
            </>
          )}
        </button>

        {/* Result */}
        {result && (
          <div
            className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
              result.success
                ? 'bg-green-900/20 text-green-400'
                : 'bg-red-900/20 text-red-400'
            }`}
          >
            {result.success ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div>
              {result.success
                ? `Posted to ${result.platforms.join(', ')}!`
                : `Failed: ${result.error}`}
            </div>
          </div>
        )}
      </div>

      {/* Post history (session only) */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Session History</h2>
          <div className="space-y-2">
            {history.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                {entry.success ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground line-clamp-2">{entry.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.platforms.join(', ')} — {entry.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
