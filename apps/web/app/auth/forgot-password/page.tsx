'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getClient } from '../../../lib/pocketbase';
import { AuthShell, AuthError, AuthSuccess } from '../../../components/auth/auth-shell';
import { Field } from '../../../components/ui/field';
import { Input } from '../../../components/ui/input';
import { Button, buttonVariants } from '../../../components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pb = getClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await pb.collection('users').requestPasswordReset(email);
      setSubmitted(true);
    } catch {
      // Always show success to prevent email enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="RESET PASSWORD" subtitle="Enter your email and we'll send you a reset link.">
      {submitted ? (
        <div className="space-y-4">
          <AuthSuccess>
            If that email exists in our system, we&apos;ve sent a password reset link.
            Check your inbox.
          </AuthSuccess>
          <Link href="/auth/login" className={buttonVariants({ variant: 'secondary', className: 'w-full' })}>
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <AuthError>{error}</AuthError>}

          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </Field>

          <Button type="submit" loading={loading} className="w-full py-3.5">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-muted">
        Remember your password?{' '}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
