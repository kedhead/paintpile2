'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@paintpile/shared';
import { getClient } from '../../../lib/pocketbase';
import { logActivity } from '../../../hooks/use-activities';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
      // Create user in PocketBase
      await pb.collection('users').create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.confirmPassword,
        name: data.displayName,
        username: data.username,
      });

      // Auto-login after signup
      await pb.collection('users').authWithPassword(data.email, data.password);
      document.cookie = `pb_auth=${pb.authStore.token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

      // Log "user joined" activity
      await logActivity(pb, pb.authStore.record!.id, {
        type: 'user_joined',
        target_id: pb.authStore.record!.id,
        target_type: 'user',
        metadata: { display_name: data.displayName },
      });

      router.push('/feed');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="relative z-10 w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src="/logofull.png" alt="Paintpile" className="mx-auto h-36 w-auto mb-2" />
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join the miniature painting community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-900/30 p-3 text-sm text-red-400">{error}</div>
          )}

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-foreground">Display Name</label>
            <input
              id="displayName"
              type="text"
              {...register('displayName')}
              className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.displayName && <p className="mt-1 text-xs text-red-400">{errors.displayName.message}</p>}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground">Username</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
              <input
                id="username"
                type="text"
                {...register('username')}
                placeholder="my_username"
                className="block w-full rounded-md border border-border pl-7 pr-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
