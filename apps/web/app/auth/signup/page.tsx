'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@paintpile/shared';
import { getClient } from '../../../lib/pocketbase';
import { logActivity } from '../../../hooks/use-activities';

// ── Vault input component ───────────────────────────────────────────────────
function VaultInput({
  id, label, type = 'text', placeholder, prefix, registration, error, focused, setFocused,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  prefix?: string;
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
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7a7898]">{prefix}</span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...registration}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused('')}
          style={{
            width: '100%',
            padding: prefix ? '12px 14px 12px 28px' : '12px 14px',
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
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const pb = getClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    setError(null);
    try {
      await pb.collection('users').create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.confirmPassword,
        name: data.displayName,
        username: data.username,
      });
      await pb.collection('users').authWithPassword(data.email, data.password);
      document.cookie = `pb_auth=${pb.authStore.token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      await logActivity(pb, pb.authStore.record!.id, {
        type: 'user_joined',
        target_id: pb.authStore.record!.id,
        target_type: 'user',
        metadata: { display_name: data.displayName },
      });
      fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.displayName, email: data.email }),
      }).catch(() => {});
      router.push('/feed');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
      setLoading(false);
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
        <div className="mb-6 text-center">
          <img
            src="/logosmall.png"
            alt="Paintpile"
            className="mx-auto mb-3 h-12 w-auto"
            style={{ filter: 'drop-shadow(0 0 20px rgba(124,58,237,.5))' }}
          />
          <h1 className="font-bebas text-5xl tracking-[.03em] leading-none text-[#f0eeff]">
            CREATE ACCOUNT
          </h1>
          <p className="mt-1 text-sm text-[#7a7898]">Join thousands of mini painters</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-900/30 p-3 text-sm text-red-400 border border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <VaultInput
            id="displayName" label="Display Name" placeholder="Your name"
            registration={register('displayName')} error={errors.displayName?.message}
            focused={focused} setFocused={setFocused}
          />
          <VaultInput
            id="username" label="Username" placeholder="my_username" prefix="@"
            registration={register('username')} error={errors.username?.message}
            focused={focused} setFocused={setFocused}
          />
          <VaultInput
            id="email" label="Email" type="email" placeholder="you@example.com"
            registration={register('email')} error={errors.email?.message}
            focused={focused} setFocused={setFocused}
          />
          <VaultInput
            id="password" label="Password" type="password" placeholder="At least 6 characters"
            registration={register('password')} error={errors.password?.message}
            focused={focused} setFocused={setFocused}
          />
          <VaultInput
            id="confirmPassword" label="Confirm Password" type="password" placeholder="Repeat your password"
            registration={register('confirmPassword')} error={errors.confirmPassword?.message}
            focused={focused} setFocused={setFocused}
          />

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{
                background: loading ? '#4a2a9a' : '#7c3aed',
                boxShadow: loading ? 'none' : '0 0 24px rgba(124,58,237,.3)',
              }}
            >
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-[11px] text-[#3e3c58] leading-relaxed">
          By continuing you agree to our Terms of Service and Privacy Policy
        </p>

        <p className="mt-5 text-center text-sm text-[#7a7898]">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-[#7c3aed] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
