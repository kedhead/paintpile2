import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { buttonVariants } from '../ui/button';
import { MiniKanban } from './mockups/mini-kanban';
import { PaintSwatches } from './mockups/paint-swatches';

export function Hero() {
  return (
    <section className="relative z-10 flex flex-col items-center px-6 pt-14 pb-24 text-center md:pt-20">
      <div className="animate-float mb-6">
        <Image
          src="/logo-256.png"
          alt="Paintpile logo"
          width={176}
          height={96}
          priority
          className="mx-auto h-20 w-auto drop-shadow-[0_0_40px_rgba(124,58,237,.7)] md:h-24"
        />
      </div>

      <div
        className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary-tint"
        style={{ animationDelay: '.05s' }}
      >
        <Sparkles size={14} /> Free to start — no credit card required
      </div>

      <h1
        className="animate-fade-up font-bebas text-6xl leading-none tracking-[.04em] text-ink md:text-8xl lg:text-9xl"
        style={{ animationDelay: '.1s' }}
      >
        PAINT SMARTER.
        <br />
        <span className="bg-gradient-to-r from-primary via-primary-tint to-gold bg-clip-text text-transparent">
          BUILD TOGETHER.
        </span>
      </h1>

      <p
        className="animate-fade-up mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl"
        style={{ animationDelay: '.15s' }}
      >
        The all-in-one platform for Warhammer &amp; tabletop miniature painters.
        Track projects, manage your paint collection, get{' '}
        <span className="font-semibold text-primary-tint">AI-powered feedback</span>,
        and share your work with a passionate community.
      </p>

      <div
        className="animate-fade-up mt-10 flex flex-col items-center gap-3 sm:flex-row"
        style={{ animationDelay: '.2s' }}
      >
        <Link
          href="/auth/signup"
          className={buttonVariants({ size: 'lg', className: 'shadow-glow-violet-lg hover:scale-[1.02]' })}
        >
          Start Painting for Free <ArrowRight size={18} />
        </Link>
        <Link
          href="/auth/login"
          className={buttonVariants({ variant: 'secondary', size: 'lg', className: 'font-medium' })}
        >
          Sign In
        </Link>
      </div>

      {/* Product mockup collage */}
      <div
        className="animate-fade-up relative mt-20 w-full max-w-3xl"
        style={{ animationDelay: '.3s' }}
      >
        <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-primary/10 blur-3xl" />
        <MiniKanban className="relative" />
        <PaintSwatches className="absolute -bottom-10 -right-6 hidden w-72 rotate-2 md:block lg:-right-24" />
      </div>
    </section>
  );
}
