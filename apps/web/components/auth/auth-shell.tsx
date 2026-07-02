import Image from 'next/image';
import { type ReactNode } from 'react';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-12 text-ink">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-[10%] -top-[20%] h-[500px] w-[500px] rounded-full bg-vault-blob-purple" />
        <div className="absolute -bottom-[10%] -left-[5%] h-[350px] w-[350px] rounded-full bg-vault-blob-gold" />
      </div>

      <div className="animate-scale-up relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="/logo-256.png"
            alt="Paintpile"
            width={103}
            height={56}
            priority
            className="mx-auto mb-4 h-14 w-auto drop-shadow-[0_0_24px_rgba(124,58,237,.5)]"
          />
          <h1 className="font-bebas text-5xl leading-none tracking-[.03em] text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-red-400">
      {children}
    </div>
  );
}

export function AuthSuccess({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">
      {children}
    </div>
  );
}
