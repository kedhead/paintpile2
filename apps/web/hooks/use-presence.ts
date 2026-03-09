'use client';

import { useEffect } from 'react';
import { useAuth } from '../components/auth-provider';

export function usePresence() {
  const { pb, user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const updatePresence = async () => {
      try {
        await pb.collection('users').update(user.id, {
          last_active_at: new Date().toISOString(),
        });
      } catch {
        // Presence update failure is non-critical
      }
    };

    // Update on mount
    updatePresence();

    // Update every 5 minutes
    const interval = setInterval(updatePresence, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [pb, user]);
}
