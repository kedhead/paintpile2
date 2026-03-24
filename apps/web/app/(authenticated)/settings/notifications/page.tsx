'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Bell, Mail, Smartphone } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';
import { DEFAULT_NOTIFICATION_PREFERENCES, type NotificationPreferences } from '@paintpile/shared';
import { PushToggle } from '../../../../components/notifications/push-prompt';

const notificationTypes = [
  { key: 'follows', label: 'New followers' },
  { key: 'likes', label: 'Likes on your work' },
  { key: 'comments', label: 'Comments' },
  { key: 'commentReplies', label: 'Comment replies' },
  { key: 'mentions', label: 'Mentions' },
] as const;

type ToggleKey = (typeof notificationTypes)[number]['key'];

export default function NotificationPreferencesPage() {
  const { pb, user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const stored = user.notification_preferences;
    if (stored && typeof stored === 'object') {
      setPrefs({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...stored });
    }
    setLoading(false);
  }, [user]);

  const toggle = (channel: 'inApp' | 'email' | 'push', key: ToggleKey) => {
    setPrefs((prev) => ({
      ...prev,
      [channel]: { ...prev[channel], [key]: !prev[channel][key] },
    }));
    setSaved(false);
  };

  const toggleChannel = (channel: 'email' | 'push') => {
    setPrefs((prev) => ({
      ...prev,
      [channel]: { ...prev[channel], enabled: !prev[channel].enabled },
    }));
    setSaved(false);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await pb.collection('users').update(user.id, {
        notification_preferences: prefs,
      });
      setSaved(true);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">Choose how you want to be notified</p>
      </div>

      {/* Channel toggles */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">Email</span>
          <input
            type="checkbox"
            checked={prefs.email.enabled}
            onChange={() => toggleChannel('email')}
            className="ml-2 accent-primary"
          />
        </label>
        <PushToggle
          enabled={prefs.push.enabled}
          onToggle={() => toggleChannel('push')}
        />
      </div>

      {/* Preferences grid */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-4 border-b border-border bg-muted/50 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>Event</span>
          <span className="text-center flex items-center justify-center gap-1">
            <Bell className="h-3.5 w-3.5" /> In-app
          </span>
          <span className="text-center flex items-center justify-center gap-1">
            <Mail className="h-3.5 w-3.5" /> Email
          </span>
          <span className="text-center flex items-center justify-center gap-1">
            <Smartphone className="h-3.5 w-3.5" /> Push
          </span>
        </div>
        {notificationTypes.map(({ key, label }) => (
          <div
            key={key}
            className="grid grid-cols-4 border-b border-border px-4 py-3 text-sm last:border-0"
          >
            <span className="text-foreground">{label}</span>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={prefs.inApp[key]}
                onChange={() => toggle('inApp', key)}
                className="accent-primary"
              />
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={prefs.email.enabled && prefs.email[key]}
                onChange={() => toggle('email', key)}
                disabled={!prefs.email.enabled}
                className="accent-primary disabled:opacity-30"
              />
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={prefs.push.enabled && prefs.push[key]}
                onChange={() => toggle('push', key)}
                disabled={!prefs.push.enabled}
                className="accent-primary disabled:opacity-30"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Email digest option */}
      {prefs.email.enabled && (
        <div className="rounded-lg border border-border bg-card p-4">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={prefs.email.digestMode}
              onChange={() =>
                setPrefs((prev) => ({
                  ...prev,
                  email: { ...prev.email, digestMode: !prev.email.digestMode },
                }))
              }
              className="accent-primary"
            />
            <div>
              <span className="text-foreground font-medium">Batch into digest</span>
              <p className="text-xs text-muted-foreground">
                Combine multiple notifications into a single email instead of sending individually
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Preferences
        </button>
        {saved && (
          <span className="text-sm text-green-500">Saved!</span>
        )}
      </div>
    </div>
  );
}
