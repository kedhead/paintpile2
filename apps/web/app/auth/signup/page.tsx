'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@paintpile/shared';
import { ArrowRight } from 'lucide-react';
import { getClient } from '../../../lib/pocketbase';
import { logActivity } from '../../../hooks/use-activities';
import { AuthShell, AuthError } from '../../../components/auth/auth-shell';
import { Field } from '../../../components/ui/field';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

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
    <AuthShell title="CREATE ACCOUNT" subtitle="Join thousands of mini painters">
      {error && <AuthError>{error}</AuthError>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <Field label="Display Name" htmlFor="displayName" error={errors.displayName?.message}>
          <Input id="displayName" placeholder="Your name" {...register('displayName')} />
        </Field>
        <Field label="Username" htmlFor="username" error={errors.username?.message}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">@</span>
            <Input id="username" placeholder="my_username" className="pl-7" {...register('username')} />
          </div>
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" placeholder="At least 6 characters" {...register('password')} />
        </Field>
        <Field label="Confirm Password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" placeholder="Repeat your password" {...register('confirmPassword')} />
        </Field>

        <div className="pt-1">
          <Button type="submit" loading={loading} className="w-full py-3.5">
            {loading ? 'Creating account…' : <>Create Account <ArrowRight size={15} /></>}
          </Button>
        </div>
      </form>

      <p className="mt-2 text-center text-[11px] leading-relaxed text-ink-subtle">
        By continuing you agree to our{' '}
        <Link href="/terms" className="underline hover:text-ink-muted">Terms of Service</Link> and{' '}
        <Link href="/privacy" className="underline hover:text-ink-muted">Privacy Policy</Link>
      </p>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
