'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../components/auth-provider';

const FEATURES = [
  { icon: '🎨', label: 'Track your projects', color: '#7c3aed' },
  { icon: '📦', label: 'Manage the Pile',     color: '#f59e0b' },
  { icon: '🖌️', label: 'Catalog your paints', color: '#10b981' },
  { icon: '👥', label: 'Share your progress', color: '#ec4899' },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0c10]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c10] px-6 py-12 text-[#f0eeff]">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute"
          style={{
            top: '-20%', right: '-10%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,.18) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '-10%', left: '-5%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,.1) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Logo */}
        <div className="animate-float mb-6">
          <img
            src="/logosmall.png"
            alt="Paintpile"
            className="mx-auto h-20 w-auto"
            style={{ filter: 'drop-shadow(0 0 32px rgba(124,58,237,.6))' }}
          />
        </div>

        {/* Title */}
        <div className="animate-fade-up mb-2" style={{ animationDelay: '.1s' }}>
          <h1 className="font-bebas text-6xl tracking-[.04em] text-[#f0eeff] leading-none">
            PAINTPILE
          </h1>
        </div>

        <div className="animate-fade-up mb-8" style={{ animationDelay: '.15s' }}>
          <p className="text-lg text-[#7a7898] leading-relaxed">
            Your mini painting{' '}
            <span className="font-semibold text-[#7c3aed]">
              journal, community &amp; toolkit.
            </span>
          </p>
        </div>

        {/* Feature grid */}
        <div
          className="animate-fade-up mb-10 grid grid-cols-2 gap-3 text-left"
          style={{ animationDelay: '.2s' }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className="animate-scale-up flex items-center gap-3 rounded-xl border border-white/[.07] bg-[#16161e] p-3"
              style={{ animationDelay: `${.25 + i * .05}s` }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
                style={{ background: `${f.color}20` }}
              >
                {f.icon}
              </div>
              <span className="text-xs font-semibold text-[#f0eeff] leading-tight">{f.label}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div
          className="animate-fade-up flex flex-col gap-3"
          style={{ animationDelay: '.4s' }}
        >
          <Link
            href="/auth/signup"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c3aed] px-6 py-3.5 text-base font-bold text-white transition-all hover:bg-[#6d28d9]"
            style={{ boxShadow: '0 0 24px rgba(124,58,237,.3)' }}
          >
            Get Started →
          </Link>
          <p className="text-sm text-[#7a7898]">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-[#7c3aed] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
