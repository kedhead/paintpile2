import Link from 'next/link';
import Image from 'next/image';
import { buttonVariants } from '../ui/button';

export function LandingNav() {
  return (
    <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/logo-64.png"
          alt="Paintpile"
          width={59}
          height={32}
          className="h-8 w-auto drop-shadow-[0_0_16px_rgba(124,58,237,.5)]"
        />
        <span className="font-bebas text-xl tracking-[.06em] text-ink">PAINTPILE</span>
      </Link>
      <div className="flex items-center gap-1">
        <a
          href="#features"
          className="hidden rounded-lg px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:block"
        >
          Features
        </a>
        <a
          href="#pricing"
          className="hidden rounded-lg px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:block"
        >
          Pricing
        </a>
        <Link
          href="/auth/login"
          className="rounded-lg px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          Sign In
        </Link>
        <Link href="/auth/signup" className={buttonVariants({ size: 'sm', className: 'ml-1 h-9 px-4' })}>
          Get Started Free
        </Link>
      </div>
    </nav>
  );
}
