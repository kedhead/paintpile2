'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@paintpile/shared';
import { getClient } from '../../../lib/pocketbase';

// ── Shared Vault field style ────────────────────────────────────────────────
function VaultInput({
  id, label, type = 'text', placeholder, registration, error, focused, setFocused,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  registration: object;
  error?: string;
  focused: string;
  setFocused: (v: string) => void;
}) {
  const isFocused = focused === id;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold tracking-[.06em] uppercase text-[#7a7898]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
        onFocus={() => setFocused(id)}
        onBlur={() => setFocused('')}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: isFocused ? '#1c1c26' : '#111118',
          border: `1.5px solid ${isFocused ? '#7c3aed' : 'rgba(255,255,255,.07)'}`,
          borderRadius: 10,
          color: '#f0eeff',
          fontSize: 14,
          outline: 'none',
          fontFamily: 'DM Sans, sans-serif',
          transition: 'all .15s',
          boxShadow: isFocused ? '0 0 0 3px rgba(124,58,237,.12)' : 'none',
        }}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const pb = getClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      await pb.collection('users').authWithPassword(data.email, data.password);
      document.cookie = `pb_auth=${pb.authStore.token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      router.push('/home');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password';
      setError(message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await pb.collection('users').authWithOAuth2({ provider: 'google' });
      document.cookie = `pb_auth=${pb.authStore.token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      router.push('/home');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message);
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12"
      style={{ background: '#0c0c10', color: '#f0eeff' }}
    >
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,.15) 0%, transparent 70%)' }} />
        <div className="absolute" style={{ bottom: '-10%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.08) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            src="/logosmall.png"
            alt="Paintpile"
            className="mx-auto mb-4 h-14 w-auto"
            style={{ filter: 'drop-shadow(0 0 24px rgba(124,58,237,.5))' }}
          />
          <h1 className="font-bebas text-5xl tracking-[.03em] leading-none text-[#f0eeff]">
            SIGN IN
          </h1>
          <p className="mt-1 text-sm text-[#7a7898]">Welcome back, painter</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-900/30 p-3 text-sm text-red-400 border border-red-900/50">
            {error}
          </div>
        )}

        {/* Google OAuth */}
        <button
          onClick={handleGoogleSignIn}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/[.07] bg-[#16161e] px-4 py-3 text-sm font-semibold text-[#f0eeff] transition-all hover:border-white/[.14] hover:bg-[#1c1c26]"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,.5)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" fill="#ea4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[.07]" />
          <span className="text-xs font-semibold tracking-[.06em] text-[#3e3c58]">OR</span>
          <div className="h-px flex-1 bg-white/[.07]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <VaultInput
            id="email" label="Email" type="email" placeholder="you@example.com"
            registration={register('email')} error={errors.email?.message}
            focused={focused} setFocused={setFocused}
          />
          <VaultInput
            id="password" label="Password" type="password" placeholder="Your password"
            registration={register('password')} error={errors.password?.message}
            focused={focused} setFocused={setFocused}
          />

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs text-[#7c3aed] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{
              background: loading ? '#4a2a9a' : '#7c3aed',
              boxShadow: loading ? 'none' : '0 0 24px rgba(124,58,237,.3)',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#7a7898]">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-semibold text-[#7c3aed] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
