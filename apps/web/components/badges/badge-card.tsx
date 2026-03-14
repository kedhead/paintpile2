'use client';

import type { RecordModel } from 'pocketbase';
import { Award, Lock } from 'lucide-react';

interface BadgeCardProps {
  badge: RecordModel;
  earned?: boolean;
  earnedAt?: string;
}

const tierGradients: Record<string, string> = {
  bronze: 'from-amber-900/40 to-amber-700/20 border-amber-700/50',
  silver: 'from-gray-500/40 to-gray-400/20 border-gray-400/50',
  gold: 'from-yellow-600/40 to-yellow-500/20 border-yellow-500/50',
  platinum: 'from-gray-300/40 to-gray-200/20 border-gray-300/50',
  legendary: 'from-orange-600/40 to-red-500/20 border-orange-500/50',
};

function isEmoji(str: string): boolean {
  // Check if the string starts with an emoji (non-ASCII, not a URL, not a plain word)
  const emojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
  return emojiRegex.test(str);
}

function BadgeIcon({ icon, name, color, earned }: { icon?: string; name: string; color?: string; earned: boolean }) {
  if (!icon) {
    return <Award className="h-5 w-5" style={{ color: earned ? color : 'var(--muted-foreground)' }} />;
  }

  // AI-generated or uploaded image URL
  if (icon.startsWith('http') || icon.startsWith('/')) {
    return <img src={icon} alt={name} className="h-full w-full object-cover" />;
  }

  // Emoji icon
  if (isEmoji(icon)) {
    return <span className="text-2xl leading-none">{icon}</span>;
  }

  // Fallback for old Lucide icon names still in DB
  return <Award className="h-5 w-5" style={{ color: earned ? color : 'var(--muted-foreground)' }} />;
}

export function BadgeCard({ badge, earned = false, earnedAt }: BadgeCardProps) {
  const gradient = tierGradients[badge.tier] || tierGradients.bronze;

  return (
    <div
      className={`relative rounded-lg border bg-gradient-to-br p-3 text-center transition-all ${
        earned ? gradient : 'border-border bg-card opacity-50 grayscale'
      }`}
    >
      {!earned && (
        <Lock className="absolute right-2 top-2 h-3 w-3 text-muted-foreground" />
      )}
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/20 overflow-hidden">
        <BadgeIcon icon={badge.icon} name={badge.name} color={badge.color} earned={earned} />
      </div>
      <h4 className="mt-2 text-xs font-bold text-foreground">{badge.name}</h4>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{badge.description}</p>
      <div className="mt-1.5 flex items-center justify-center gap-1">
        <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-foreground">
          {badge.tier}
        </span>
        <span className="text-[10px] text-muted-foreground">{badge.points}pts</span>
      </div>
    </div>
  );
}
