'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Paintbrush, Upload, Camera, ArrowRight, ArrowLeft,
  Palette, Shield, Users, ChefHat, Check,
} from 'lucide-react';
import { useAuth } from '../auth-provider';
import { getFileUrl } from '../../lib/pb-helpers';

const STORAGE_KEY = 'paintpile-onboarded';

export function OnboardingModal() {
  const { user, pb } = useAuth();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  // Profile step state
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    // Check server-side flag first — persists across devices/browsers
    if ((user.settings as Record<string, unknown>)?.hasSeenOnboarding) return;
    // Fallback: localStorage (catches cases where PB update hasn't propagated yet)
    const onboarded = localStorage.getItem(`${STORAGE_KEY}-${user.id}`);
    if (!onboarded) {
      setShow(true);
    }
  }, [user]);

  const finish = () => {
    if (user) {
      localStorage.setItem(`${STORAGE_KEY}-${user.id}`, 'true');
      // Persist to PocketBase so it won't re-appear on other devices/browsers
      pb.collection('users').update(user.id, {
        settings: { ...(user.settings as object || {}), hasSeenOnboarding: true },
      }).catch(() => {}); // fire-and-forget — non-critical
    }
    setShow(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const formData = new FormData();
      if (bio.trim()) formData.append('bio', bio.trim());
      if (avatarFile) formData.append('avatar', avatarFile);
      await pb.collection('users').update(user.id, formData);
    } catch {
      // Non-critical — they can update profile later
    }
    setSaving(false);
    setStep(2);
  };

  if (!show || !user) return null;

  const currentAvatar = user.avatar ? getFileUrl(user, user.avatar, '100x100') : null;
  const displayAvatar = avatarPreview || currentAvatar;

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Paintbrush className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground">
        Welcome to PaintPile, {user.name || 'painter'}!
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your home for tracking painting projects, sharing progress, and connecting with fellow hobbyists.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Let&apos;s get you set up in just a couple of steps.
      </p>
      <button
        onClick={() => setStep(1)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/80"
      >
        Get Started
        <ArrowRight className="h-4 w-4" />
      </button>
      <button
        onClick={finish}
        className="mt-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Skip for now
      </button>
    </div>,

    // Step 1: Profile setup
    <div key="profile">
      <h2 className="text-lg font-bold text-foreground">Set up your profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Add a photo and short bio so others can find you.
      </p>

      <div className="mt-5 flex flex-col items-center gap-4">
        {/* Avatar */}
        <button
          onClick={() => fileRef.current?.click()}
          className="group relative h-20 w-20 overflow-hidden rounded-full border-2 border-dashed border-border hover:border-primary transition-colors"
        >
          {displayAvatar ? (
            <img src={displayAvatar} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Camera className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="h-5 w-5 text-white" />
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <span className="text-xs text-muted-foreground">Click to upload photo</span>
      </div>

      {/* Bio */}
      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-foreground">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          maxLength={200}
          placeholder="e.g. Warhammer 40K enthusiast, mostly painting Space Marines..."
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <p className="mt-0.5 text-right text-xs text-muted-foreground">{bio.length}/200</p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setStep(0)}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={() => setStep(2)}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          Skip
        </button>
        <button
          onClick={saveProfile}
          disabled={saving || (!bio.trim() && !avatarFile)}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save & Continue'}
          {!saving && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>,

    // Step 2: Quick actions
    <div key="actions">
      <h2 className="text-lg font-bold text-foreground">You&apos;re all set!</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Here are some things you can do to get started:
      </p>

      <div className="mt-4 space-y-2">
        {[
          {
            icon: Palette,
            color: 'text-blue-400 bg-blue-400/10',
            label: 'Start a Project',
            desc: 'Track your painting progress from start to finish',
            href: '/projects',
          },
          {
            icon: Shield,
            color: 'text-purple-400 bg-purple-400/10',
            label: 'Build an Army',
            desc: 'Group projects into army collections',
            href: '/projects?tab=armies',
          },
          {
            icon: ChefHat,
            color: 'text-orange-400 bg-orange-400/10',
            label: 'Share a Recipe',
            desc: 'Document your paint recipes for others',
            href: '/recipes/new',
          },
          {
            icon: Users,
            color: 'text-cyan-400 bg-cyan-400/10',
            label: 'Join a Group',
            desc: 'Find your community and chat with fellow painters',
            href: '/groups',
          },
        ].map(({ icon: Icon, color, label, desc, href }) => (
          <button
            key={label}
            onClick={() => { finish(); router.push(href); }}
            className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>

      <button
        onClick={finish}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/80"
      >
        <Check className="h-4 w-4" />
        Go to Feed
      </button>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        {/* Step dots */}
        <div className="mb-5 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>

        {steps[step]}
      </div>
    </div>
  );
}
