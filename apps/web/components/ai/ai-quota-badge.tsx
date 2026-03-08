'use client';

import { Sparkles } from 'lucide-react';
import { useAIQuota } from '../../hooks/use-ai';

export function AIQuotaBadge() {
  const { data: quota } = useAIQuota();

  if (!quota) return null;

  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const used = quota.monthly_usage?.[monthKey] || 0;
  const limit = quota.monthly_limit || 500;
  const remaining = Math.max(0, limit - used);

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
      <Sparkles className="h-3 w-3" />
      {remaining} credits
    </div>
  );
}
