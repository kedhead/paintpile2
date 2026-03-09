'use client';

import { useState, useEffect } from 'react';
import { X, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { useUnreadCount } from '../../hooks/use-notifications';

export function WelcomeBackModal() {
  const { user } = useAuth();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;

    const lastVisit = localStorage.getItem(`paintpile-last-visit-${user.id}`);
    const now = Date.now();

    // Show if last visit was more than 24 hours ago
    if (lastVisit && now - parseInt(lastVisit) > 24 * 60 * 60 * 1000 && unreadCount > 0) {
      setShow(true);
    }

    // Update last visit
    localStorage.setItem(`paintpile-last-visit-${user.id}`, String(now));
  }, [user, unreadCount]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <button
          onClick={() => setShow(false)}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-3 text-lg font-bold text-foreground">Welcome back!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You have{' '}
            <span className="font-semibold text-primary">{unreadCount}</span>{' '}
            unread notification{unreadCount !== 1 ? 's' : ''} since your last visit.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setShow(false)}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Dismiss
            </button>
            <a
              href="/notifications"
              onClick={() => setShow(false)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
            >
              <Bell className="h-4 w-4" />
              View Notifications
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
