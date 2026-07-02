'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@paintpile/shared';
import { ArrowRight } from 'lucide-react';
import { getClient } from '../../../lib/pocketbase';
import { AuthShell, AuthError } from '../../../components/auth/auth-shell';
import { Field } from '../../../components/ui/field';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
      router.push('/feed');
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
      router.push('/feed');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message);
    }
  };

  return (
    <AuthShell title="SIGN IN" subtitle="Welcome back, painter">
      {error && <AuthError>{error}</AuthError>}

      {/* Google OAuth */}
      <button
        onClick={handleGoogleSignIn}
        className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-edge bg-surface px-4 py-3 text-sm font-semibold text-ink shadow-vault transition-all hover:border-edge-strong hover:bg-surface-raised"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" fill="#ea4335"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[.07]" />
        <span className="text-xs font-semibold tracking-[.06em] text-ink-subtle">OR</span>
        <div className="h-px flex-1 bg-white/[.07]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" placeholder="Your password" {...register('password')} />
        </Field>

        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full py-3.5">
          {loading ? 'Signing in…' : <>Sign In <ArrowRight size={15} /></>}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
