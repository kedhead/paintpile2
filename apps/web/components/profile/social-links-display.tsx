'use client';

import { Globe, Instagram, Twitter, Youtube } from 'lucide-react';

interface SocialLinksDisplayProps {
  links: Record<string, string>;
}

const platformIcons: Record<string, { icon: typeof Globe; getUrl: (val: string) => string }> = {
  instagram: { icon: Instagram, getUrl: (v) => (v.startsWith('http') ? v : `https://instagram.com/${v}`) },
  twitter: { icon: Twitter, getUrl: (v) => (v.startsWith('http') ? v : `https://x.com/${v}`) },
  youtube: { icon: Youtube, getUrl: (v) => (v.startsWith('http') ? v : `https://youtube.com/${v}`) },
  tiktok: { icon: Globe, getUrl: (v) => (v.startsWith('http') ? v : `https://tiktok.com/@${v}`) },
  website: { icon: Globe, getUrl: (v) => (v.startsWith('http') ? v : `https://${v}`) },
};

export function SocialLinksDisplay({ links }: SocialLinksDisplayProps) {
  const parsedLinks = typeof links === 'string' ? JSON.parse(links || '{}') : (links || {});
  const entries = Object.entries(parsedLinks).filter(([, val]) => val);

  if (entries.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {entries.map(([platform, value]) => {
        const config = platformIcons[platform] || { icon: Globe, getUrl: (v: string) => v };
        const Icon = config.icon;
        return (
          <a
            key={platform}
            href={config.getUrl(value as string)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title={platform.charAt(0).toUpperCase() + platform.slice(1)}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
