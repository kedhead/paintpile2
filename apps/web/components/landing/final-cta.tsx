import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '../ui/button';

export function FinalCta() {
  return (
    <section className="relative z-10 px-6 py-24 text-center md:px-12">
      <div className="mx-auto max-w-2xl">
        <div className="animate-float mb-6">
          <Image
            src="/logo-256.png"
            alt="Paintpile"
            width={117}
            height={64}
            className="mx-auto h-16 w-auto drop-shadow-[0_0_32px_rgba(124,58,237,.6)]"
          />
        </div>
        <h2 className="font-bebas text-5xl leading-none tracking-[.04em] text-ink md:text-6xl">
          YOUR NEXT MASTERPIECE
          <br />
          <span className="bg-gradient-to-r from-primary to-primary-tint bg-clip-text text-transparent">
            STARTS HERE
          </span>
        </h2>
        <p className="mt-5 text-lg text-ink-muted">
          Join miniature painters who track their work, grow their skills,
          and share their passion on Paintpile.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/signup"
            className={buttonVariants({ size: 'lg', className: 'px-10 shadow-glow-violet-lg hover:scale-[1.02]' })}
          >
            Create Your Free Account <ArrowRight size={18} />
          </Link>
        </div>
        <p className="mt-3 text-sm text-ink-subtle">
          Free forever · No credit card · Cancel Pro anytime
        </p>
      </div>
    </section>
  );
}
