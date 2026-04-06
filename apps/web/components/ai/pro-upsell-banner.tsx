'use client';

import { Crown, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../auth-provider';

interface ProUpsellBannerProps {
  context?: 'critique' | 'credits-low' | 'credits-out';
}

export function ProUpsellBanner({ context = 'critique' }: ProUpsellBannerProps) {
  const { user } = useAuth();
  if (user?.subscription === 'pro') return null;

  const messages = {
    critique: {
      title: 'Want more critiques?',
      body: 'Upgrade to Pro for 2,000 credits/month and an ad-free experience.',
    },
    'credits-low': {
      title: 'Running low on credits',
      body: 'Upgrade to Pro for 4x more credits, or grab a one-time credit pack.',
    },
    'credits-out': {
      title: 'Out of credits',
      body: 'Your free credits reset next month. Upgrade to Pro for 2,000/month or buy a credit pack.',
    },
  };

  const { title, body } = messages[context];

  return (
    <div className="rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5 p-4">
      <div className="flex items-start gap-3">
        <Crown className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/settings/subscription"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Crown className="h-3 w-3" />
              Upgrade to Pro — $5/mo
            </Link>
            <Link
              href="/settings/subscription#credits"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Zap className="h-3 w-3" />
              Buy Credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
