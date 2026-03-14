'use client';

import { useEffect, useState } from 'react';
import { Award, X } from 'lucide-react';
import type { NewlyEarnedBadge } from '../../lib/badge-checker';

interface BadgeToastProps {
  badges: NewlyEarnedBadge[];
  onDismiss: () => void;
}

function isEmoji(str: string): boolean {
  const emojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
  return emojiRegex.test(str);
}

export function BadgeToast({ badges, onDismiss }: BadgeToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (badges.length === 0) return;
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    // Auto dismiss after 6 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 6000);
    return () => clearTimeout(timer);
  }, [badges, onDismiss]);

  if (badges.length === 0) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="rounded-xl border border-yellow-500/30 bg-card/95 backdrop-blur-sm p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
              {badges.length === 1 && badges[0].badgeIcon && isEmoji(badges[0].badgeIcon) ? (
                <span className="text-2xl">{badges[0].badgeIcon}</span>
              ) : (
                <Award className="h-5 w-5 text-yellow-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {badges.length === 1 ? 'Badge Earned!' : `${badges.length} Badges Earned!`}
              </p>
              <p className="text-xs text-muted-foreground">
                {badges.map((b) => `${b.badgeIcon || '🏆'} ${b.badgeName}`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
