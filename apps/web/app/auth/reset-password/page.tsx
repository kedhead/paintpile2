'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getClient } from '../../../lib/pocketbase';
import { AuthShell, AuthError, AuthSuccess } from '../../../components/auth/auth-shell';
import { Field } from '../../../components/ui/field';
import { Input } from '../../../components/ui/input';
import { Button, buttonVariants } from '../../../components/ui/button';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pb = getClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await pb.collection('users').confirmPasswordReset(token!, password, confirmPassword);
      setSuccess(true);
    } catch {
      setError('Invalid or expired reset link. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="RESET PASSWORD">
        <AuthError>Invalid reset link. Please request a new password reset.</AuthError>
        <Link href="/auth/forgot-password" className={buttonVariants({ className: 'w-full' })}>
          Request New Reset Link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="SET NEW PASSWORD" subtitle="Enter your new password below.">
      {success ? (
        <div className="space-y-4">
          <AuthSuccess>Your password has been reset successfully.</AuthSuccess>
          <Link href="/auth/login" className={buttonVariants({ className: 'w-full' })}>
            Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <AuthError>{error}</AuthError>}

          <Field label="New Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </Field>

          <Field label="Confirm New Password" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </Field>

          <Button type="submit" loading={loading} className="w-full py-3.5">
            {loading ? 'Resetting…' : 'Reset Password'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
