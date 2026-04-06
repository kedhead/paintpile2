'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAIQuota } from '../../hooks/use-ai';
import { useAuth } from '../auth-provider';

export function AIQuotaBadge() {
  const { user } = useAuth();
  const { data: quota } = useAIQuota();

  if (!quota) return null;

  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const used = quota.monthly_usage?.[monthKey] || 0;
  const limit = quota.monthly_limit || (user?.subscription === 'pro' ? 2000 : 500);
  const bonus = quota.bonus_credits || 0;
  const remaining = Math.max(0, limit - used + bonus);
  const isLow = remaining < 50 && user?.subscription !== 'pro';

  return (
    <Link
      href="/settings/subscription#credits"
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80 ${
        isLow
          ? 'bg-amber-500/10 text-amber-400'
          : 'bg-purple-500/10 text-purple-400'
      }`}
    >
      <Sparkles className="h-3 w-3" />
      {remaining} credits
      {bonus > 0 && <span className="text-green-400">(+{bonus})</span>}
    </Link>
  );
}
