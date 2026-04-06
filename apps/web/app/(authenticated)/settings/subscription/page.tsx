'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Loader2, Check, Crown, Zap, Image, Ban } from 'lucide-react';
import { useSubscription } from '../../../../hooks/use-subscription';
import { useAuth } from '../../../../components/auth-provider';

const features = [
  { name: 'AI Credits / month', free: '500', pro: '2,000', icon: Zap },
  { name: 'Feed Ads', free: 'Yes', pro: 'No ads', icon: Ban },
  { name: 'AI Image Upscaling', free: 'Basic', pro: 'Priority', icon: Image },
  { name: 'Pro Badge', free: 'No', pro: 'Yes', icon: Crown },
];

const creditPacks = [
  { size: 'small' as const, credits: 200, price: '$2', label: 'Starter' },
  { size: 'medium' as const, credits: 500, price: '$4', label: 'Popular', highlight: true },
  { size: 'large' as const, credits: 1200, price: '$8', label: 'Best Value' },
];

function SubscriptionContent() {
  const { user, pb } = useAuth();
  const { isPro, subscribe, manageBilling, loading } = useSubscription();
  const searchParams = useSearchParams();
  const status = searchParams?.get('status');
  const creditsAdded = searchParams?.get('credits');
  const [packLoading, setPackLoading] = useState<string | null>(null);

  const handleBuyPack = async (packSize: 'small' | 'medium' | 'large') => {
    setPackLoading(packSize);
    try {
      const res = await fetch('/api/billing/credit-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pbToken: pb.authStore.token, packSize }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } finally {
      setPackLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your Paintpile plan</p>
      </div>

      {status === 'success' && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
          Welcome to Pro! Your subscription is now active.
        </div>
      )}

      {status === 'credits-added' && creditsAdded && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
          {creditsAdded} bonus credits added to your account!
        </div>
      )}

      {status === 'canceled' && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-400">
          Checkout was canceled. You can try again whenever you&apos;re ready.
        </div>
      )}

      {/* Current plan */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          {isPro ? (
            <Crown className="h-8 w-8 text-yellow-500" />
          ) : (
            <Zap className="h-8 w-8 text-muted-foreground" />
          )}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isPro ? 'Pro Plan' : 'Free Plan'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isPro ? 'You have access to all Pro features' : 'Upgrade to unlock more features'}
            </p>
          </div>
        </div>
      </div>

      {/* Feature comparison */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-3 border-b border-border bg-muted/50 px-4 py-3 text-sm font-medium">
          <span className="text-muted-foreground">Feature</span>
          <span className="text-center text-muted-foreground">Free</span>
          <span className="text-center text-primary">Pro</span>
        </div>
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div key={feat.name} className="grid grid-cols-3 border-b border-border px-4 py-3 text-sm last:border-0">
              <span className="flex items-center gap-2 text-foreground">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {feat.name}
              </span>
              <span className="text-center text-muted-foreground">{feat.free}</span>
              <span className="text-center text-foreground font-medium">{feat.pro}</span>
            </div>
          );
        })}
      </div>

      {/* Subscription action */}
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        {isPro ? (
          <button
            onClick={manageBilling}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-muted px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Manage Subscription
          </button>
        ) : (
          <>
            <p className="mb-4 text-2xl font-bold text-foreground">
              $5<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
            <button
              onClick={subscribe}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
              Upgrade to Pro
            </button>
          </>
        )}
      </div>

      {/* Credit Packs */}
      <div id="credits" className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Credit Packs</h2>
          <p className="text-sm text-muted-foreground">
            One-time purchases. Credits never expire and stack with your monthly allowance.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {creditPacks.map((pack) => (
            <button
              key={pack.size}
              onClick={() => handleBuyPack(pack.size)}
              disabled={!!packLoading}
              className={`relative rounded-lg border p-4 text-center transition-colors disabled:opacity-50 ${
                pack.highlight
                  ? 'border-primary bg-primary/5 hover:bg-primary/10'
                  : 'border-border bg-card hover:bg-muted'
              }`}
            >
              {pack.highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  POPULAR
                </span>
              )}
              <p className="text-xs font-medium text-muted-foreground">{pack.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{pack.credits}</p>
              <p className="text-xs text-muted-foreground">credits</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{pack.price}</p>
              {packLoading === pack.size ? (
                <Loader2 className="mx-auto mt-2 h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <p className="mt-2 text-xs text-primary font-medium">Buy Now</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}
