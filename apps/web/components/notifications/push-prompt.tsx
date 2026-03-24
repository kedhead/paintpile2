'use client';

import { Smartphone, Loader2 } from 'lucide-react';
import { usePushSubscription } from '../../hooks/use-push-subscription';

interface PushToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function PushToggle({ enabled, onToggle }: PushToggleProps) {
  const { permission, subscribed, loading, subscribe, unsubscribe } = usePushSubscription();

  const handleToggle = async () => {
    if (!enabled) {
      // Enabling push — request permission and subscribe
      if (!subscribed && permission !== 'denied') {
        await subscribe();
      }
    } else {
      // Disabling push — unsubscribe
      if (subscribed) {
        await unsubscribe();
      }
    }
    onToggle();
  };

  if (permission === 'unsupported') {
    return (
      <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm opacity-50">
        <Smartphone className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Push (not supported)</span>
      </label>
    );
  }

  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Smartphone className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="text-foreground">Push</span>
      {permission === 'denied' ? (
        <span className="ml-2 text-xs text-red-400">Blocked</span>
      ) : (
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          disabled={loading}
          className="ml-2 accent-primary"
        />
      )}
    </label>
  );
}

export function PushPermissionBanner() {
  const { permission, subscribed, loading, subscribe } = usePushSubscription();

  if (permission !== 'prompt' || subscribed) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Enable push notifications</p>
            <p className="text-xs text-muted-foreground">Get notified when someone interacts with your work</p>
          </div>
        </div>
        <button
          onClick={subscribe}
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Enable'}
        </button>
      </div>
    </div>
  );
}
