'use client';

import { useState } from 'react';
import { useAuth } from '../components/auth-provider';

export function useSubscription() {
  const { user, pb } = useAuth();
  const [loading, setLoading] = useState(false);

  const isPro = user?.subscription === 'pro';

  async function subscribe() {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pbToken: pb.authStore.token }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } finally {
      setLoading(false);
    }
  }

  async function manageBilling() {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pbToken: pb.authStore.token }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create portal session');
      }
    } finally {
      setLoading(false);
    }
  }

  return { isPro, subscribe, manageBilling, loading };
}
