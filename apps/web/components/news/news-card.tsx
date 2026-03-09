'use client';

import type { RecordModel } from 'pocketbase';
import { Megaphone, Star, Wrench, AlertTriangle } from 'lucide-react';
import { relativeTime } from '../../lib/pb-helpers';

interface NewsCardProps {
  item: RecordModel;
}

const typeConfig: Record<string, { icon: typeof Star; color: string; borderColor: string; label: string }> = {
  update: { icon: Star, color: 'text-blue-400', borderColor: 'border-l-blue-400', label: 'Update' },
  feature: { icon: Star, color: 'text-green-400', borderColor: 'border-l-green-400', label: 'New Feature' },
  announcement: { icon: Megaphone, color: 'text-amber-400', borderColor: 'border-l-amber-400', label: 'Announcement' },
  maintenance: { icon: Wrench, color: 'text-red-400', borderColor: 'border-l-red-400', label: 'Maintenance' },
};

export function NewsCard({ item }: NewsCardProps) {
  const config = typeConfig[item.type] || typeConfig.update;
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border border-border border-l-4 ${config.borderColor} bg-card p-4`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
        <span className="text-xs text-muted-foreground">{relativeTime(item.created)}</span>
      </div>
      <h3 className="mt-2 font-semibold text-foreground">{item.title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{item.content}</p>
    </div>
  );
}
