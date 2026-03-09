'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '../auth-provider';

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'username' },
  { key: 'twitter', label: 'Twitter/X', placeholder: 'username' },
  { key: 'youtube', label: 'YouTube', placeholder: 'channel URL' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'username' },
  { key: 'website', label: 'Website', placeholder: 'https://...' },
];

interface SocialLinksEditorProps {
  initialLinks: Record<string, string>;
  onSave: (links: Record<string, string>) => Promise<void>;
}

export function SocialLinksEditor({ initialLinks, onSave }: SocialLinksEditorProps) {
  const [links, setLinks] = useState<Record<string, string>>(initialLinks || {});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(links);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Social Links</h3>
      {PLATFORMS.map(({ key, label, placeholder }) => (
        <div key={key} className="flex items-center gap-2">
          <label className="w-24 text-xs text-muted-foreground">{label}</label>
          <input
            type="text"
            placeholder={placeholder}
            value={links[key] || ''}
            onChange={(e) => setLinks({ ...links, [key]: e.target.value })}
            className="flex-1 rounded border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        Save Links
      </button>
    </div>
  );
}
