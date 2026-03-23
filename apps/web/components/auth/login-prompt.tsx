'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogIn, UserPlus, X } from 'lucide-react';

interface LoginPromptProps {
  action: string;
  children: (open: () => void) => React.ReactNode;
}

export function LoginPrompt({ action, children }: LoginPromptProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {children(() => setIsOpen(true))}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">Sign in to {action}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Join the Paintpile community to interact with other painters.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
