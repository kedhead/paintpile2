import Link from 'next/link';

const STATS = [
  { value: '4,700+', label: 'Paints in database' },
  { value: 'Free',   label: 'To start, always' },
  { value: 'AI',     label: 'Critique & suggestions' },
  { value: 'Active', label: 'Community' },
];

const FEATURES = [
  {
    icon: '🎯',
    label: 'Project Tracking',
    color: '#7c3aed',
    desc: 'Kanban board for every miniature. Move pieces from backlog to done and watch your army grow.',
  },
  {
    icon: '📦',
    label: 'The Pile',
    color: '#f59e0b',
    desc: 'Tame your unpainted backlog. Log, prioritize, and celebrate every box that leaves "the pile".',
  },
  {
    icon: '🖌️',
    label: 'Paint Inventory',
    color: '#10b981',
    desc: '4,700+ paints from Citadel, Vallejo, Army Painter and more. Know what you have before you buy.',
  },
  {
    icon: '🤖',
    label: 'AI Tools',
    color: '#a78bfa',
    desc: 'Upload a photo and get detailed critique, paint recommendations, and recipe generation in seconds.',
  },
  {
    icon: '👥',
    label: 'Social Feed',
    color: '#ec4899',
    desc: 'Share your WIPs and finished pieces. Follow painters you admire and get inspired daily.',
  },
  {
    icon: '🏆',
    label: 'Challenges & Badges',
    color: '#f59e0b',
    desc: 'Join painting challenges, earn community badges, and push your skills with monthly themes.',
  },
];

const AI_BULLETS = [
  'Photo critique with specific technique feedback',
  'Paint match suggestions from 4,700+ paints',
  'Recipe generation for any colour scheme',
];

const COMMUNITY_ITEMS = [
  {
    icon: '🏘️',
    title: 'Community Groups',
    desc: "Join groups around your faction, brand, or style. Warhammer 40k, Age of Sigmar, Contrast painters — there's a home for everyone.",
    color: '#10b981',
  },
  {
    icon: '📰',
    title: 'Social Feed',
    desc: 'A focused feed of miniature painting. No noise. Just WIPs, finished pieces, and inspiration from painters you follow.',
    color: '#ec4899',
  },
  {
    icon: '🏆',
    title: 'Monthly Challenges',
    desc: 'Community-run painting challenges every month. Compete, collaborate, and earn exclusive badges for your profile.',
    color: '#f59e0b',
  },
];

const FREE_FEATURES = [
  'Unlimited projects & The Pile',
  'Full paint inventory (4,700+ paints)',
  'Social feed, groups & challenges',
  '150 AI credits / month',
  'Community recipes & tutorials',
];

const PRO_FEATURES = [
  'Everything in Free',
  '1,500 AI credits / month (10× more)',
  'No feed advertisements',
  'Priority AI image upscaling',
  'Exclusive Pro badge on profile',
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-[#0c0c10] text-[#f0eeff]" style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* Fixed ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute"
          style={{
            top: '-10%', right: '-5%',
            width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,.15) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '-5%', left: '-5%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,.08) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2.5">
          <img
            src="/logosmall.png"
            alt="Paintpile"
            className="h-8 w-auto"
            style={{ filter: 'drop-shadow(0 0 16px rgba(124,58,237,.5))' }}
          />
          <span className="font-bebas text-xl tracking-[.06em] text-[#f0eeff]">PAINTPILE</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#7a7898] transition-colors hover:text-[#f0eeff]"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:bg-[#6d28d9]"
            style={{ background: '#7c3aed', boxShadow: '0 0 20px rgba(124,58,237,.3)' }}
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center px-6 pt-16 pb-20 text-center md:pt-24 md:pb-28">
        <div className="animate-float mb-6">
          <img
            src="/logosmall.png"
            alt="Paintpile logo"
            fetchPriority="high"
            className="mx-auto h-20 w-auto md:h-24"
            style={{ filter: 'drop-shadow(0 0 40px rgba(124,58,237,.7))' }}
          />
        </div>

        <div
          className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-4 py-1.5 text-sm font-semibold text-[#a78bfa]"
          style={{ animationDelay: '.05s' }}
        >
          <span>✦</span> Free to start — no credit card required
        </div>

        <h1
          className="animate-fade-up font-bebas text-6xl leading-none tracking-[.04em] text-[#f0eeff] md:text-8xl lg:text-9xl"
          style={{ animationDelay: '.1s' }}
        >
          PAINT SMARTER.<br />
          <span style={{ color: '#7c3aed' }}>BUILD TOGETHER.</span>
        </h1>

        <p
          className="animate-fade-up mt-6 max-w-2xl text-lg leading-relaxed text-[#7a7898] md:text-xl"
          style={{ animationDelay: '.15s' }}
        >
          The all-in-one platform for Warhammer &amp; tabletop miniature painters.
          Track projects, manage your paint collection, get{' '}
          <span className="font-semibold text-[#a78bfa]">AI-powered feedback</span>,
          and share your work with a passionate community.
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: '.2s' }}
        >
          <Link
            href="/auth/signup"
            className="flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all hover:bg-[#6d28d9] hover:scale-[1.02]"
            style={{ background: '#7c3aed', boxShadow: '0 0 32px rgba(124,58,237,.4)' }}
          >
            Start Painting for Free →
          </Link>
          <Link
            href="/auth/login"
            className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-[#f0eeff] transition-all hover:bg-white/10"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section
        className="relative z-10 border-y border-white/[.06]"
        style={{ background: 'rgba(22,22,30,.6)', backdropFilter: 'blur(8px)' }}
      >
        <div className="mx-auto grid max-w-4xl grid-cols-2 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center px-6 py-6 text-center"
              style={{ borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}
            >
              <span className="font-bebas text-3xl tracking-[.04em] text-[#7c3aed]">{stat.value}</span>
              <span className="mt-1 text-xs font-medium text-[#7a7898]">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="relative z-10 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="font-bebas text-4xl tracking-[.04em] text-[#f0eeff] md:text-5xl">
              EVERYTHING YOU NEED TO LEVEL UP
            </h2>
            <p className="mt-3 text-[#7a7898]">
              Built by painters, for painters — every feature comes from the community.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="rounded-2xl border border-white/[.07] bg-[#16161e] p-5 transition-all hover:border-white/[.12]"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,.5), 0 4px 16px rgba(0,0,0,.3)' }}
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                  style={{ background: `${f.color}20` }}
                >
                  {f.icon}
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-[#f0eeff]">{f.label}</h3>
                <p className="text-xs leading-relaxed text-[#7a7898]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI callout ── */}
      <section className="relative z-10 px-6 py-16 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div
            className="relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,.15) 0%, rgba(167,139,250,.08) 50%, rgba(236,72,153,.08) 100%)',
              border: '1px solid rgba(124,58,237,.3)',
              boxShadow: '0 0 60px rgba(124,58,237,.15)',
            }}
          >
            <div
              className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(167,139,250,.2) 0%, transparent 70%)' }}
            />

            <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
              {/* Left: text */}
              <div className="flex-1">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#7c3aed]/20 px-3 py-1 text-xs font-semibold text-[#a78bfa]">
                  ✦ AI-Powered Features
                </div>
                <h2 className="font-bebas text-4xl leading-none tracking-[.04em] text-[#f0eeff] md:text-5xl">
                  YOUR PERSONAL<br />
                  <span style={{ color: '#a78bfa' }}>PAINTING COACH</span>
                </h2>
                <p className="mt-4 leading-relaxed text-[#7a7898]">
                  Upload a photo of your miniature and get instant, detailed critique —
                  highlighting what works and what to improve. Ask for paint suggestions
                  to match any scheme, and generate full step-by-step recipes.
                </p>
                <ul className="mt-5 space-y-2">
                  {AI_BULLETS.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-[#c4b5fd]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7c3aed]/20 text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: mock UI preview */}
              <div
                className="w-full flex-shrink-0 rounded-2xl border border-white/[.08] bg-[#0e0e16] p-5 md:w-72"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,.6)' }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#7c3aed]" />
                  <span className="text-xs font-semibold text-[#7a7898]">AI Critique</span>
                </div>
                <div
                  className="mb-3 flex h-28 items-center justify-center rounded-xl bg-[#1c1c26]"
                  style={{ border: '1px dashed rgba(124,58,237,.2)' }}
                >
                  <span className="text-3xl">🖼️</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 w-4/5 rounded-full bg-[#1c1c26]" />
                  <div className="h-2.5 w-3/5 rounded-full bg-[#1c1c26]" />
                  <div className="h-2.5 w-4/5 rounded-full bg-[#1c1c26]" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 rounded-lg bg-[#7c3aed]/20 py-2 text-center text-xs font-semibold text-[#a78bfa]">Critique</div>
                  <div className="flex-1 rounded-lg bg-[#1c1c26] py-2 text-center text-xs font-semibold text-[#7a7898]">Recipe</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community ── */}
      <section className="relative z-10 px-6 py-20 md:px-12" style={{ background: 'rgba(22,22,30,.4)' }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="font-bebas text-4xl tracking-[.04em] text-[#f0eeff] md:text-5xl">
              A COMMUNITY BUILT ON PASSION
            </h2>
            <p className="mt-3 text-[#7a7898]">
              Connect with painters who share your obsession.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {COMMUNITY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/[.07] bg-[#16161e] p-6"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,.5)' }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                >
                  {item.icon}
                </div>
                <h3 className="mb-2 font-bold text-[#f0eeff]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[#7a7898]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="relative z-10 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="font-bebas text-4xl tracking-[.04em] text-[#f0eeff] md:text-5xl">
              SIMPLE, HONEST PRICING
            </h2>
            <p className="mt-3 text-[#7a7898]">Start free, upgrade when you&apos;re ready.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border border-white/[.08] bg-[#16161e] p-8">
              <div className="mb-1 text-sm font-semibold uppercase tracking-[.08em] text-[#7a7898]">Free</div>
              <div className="mb-4 font-bebas text-5xl tracking-[.02em] text-[#f0eeff]">
                $0 <span className="text-xl font-normal text-[#7a7898]">/ month</span>
              </div>
              <p className="mb-6 text-sm text-[#7a7898]">Everything you need to get started. No credit card required.</p>
              <ul className="mb-8 space-y-3">
                {FREE_FEATURES.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-[#7a7898]">✓</span>
                    <span className="text-[#b0aecf]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full rounded-xl border border-white/10 py-3 text-center text-sm font-bold text-[#f0eeff] transition-all hover:border-white/20 hover:bg-white/5"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div
              className="relative rounded-2xl p-8"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,.15) 0%, rgba(22,22,30,1) 60%)',
                border: '1px solid rgba(124,58,237,.4)',
                boxShadow: '0 0 40px rgba(124,58,237,.15)',
              }}
            >
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#7c3aed] px-4 py-1 text-xs font-bold text-white"
                style={{ boxShadow: '0 0 16px rgba(124,58,237,.5)' }}
              >
                ✦ MOST POPULAR
              </div>

              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold uppercase tracking-[.08em] text-[#a78bfa]">Pro</span>
                <span className="rounded-full bg-[#f59e0b]/15 px-2 py-0.5 text-xs font-bold text-[#f59e0b]">👑 PRO</span>
              </div>
              <div className="mb-4 font-bebas text-5xl tracking-[.02em] text-[#f0eeff]">
                $5 <span className="text-xl font-normal text-[#a78bfa]">/ month</span>
              </div>
              <p className="mb-6 text-sm text-[#7a7898]">For serious painters who want the full toolkit.</p>
              <ul className="mb-8 space-y-3">
                {PRO_FEATURES.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7c3aed]/30 text-xs text-[#a78bfa]">✓</span>
                    <span className="text-[#c4b5fd]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full rounded-xl py-3 text-center text-sm font-bold text-white transition-all hover:bg-[#6d28d9]"
                style={{ background: '#7c3aed', boxShadow: '0 0 24px rgba(124,58,237,.3)' }}
              >
                Start Free, Upgrade Anytime →
              </Link>
              <p className="mt-2 text-center text-xs text-[#7a7898]">Cancel any time. No contracts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative z-10 px-6 py-24 text-center md:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="animate-float mb-6">
            <img
              src="/logosmall.png"
              alt="Paintpile"
              className="mx-auto h-16 w-auto"
              style={{ filter: 'drop-shadow(0 0 32px rgba(124,58,237,.6))' }}
            />
          </div>
          <h2 className="font-bebas text-5xl leading-none tracking-[.04em] text-[#f0eeff] md:text-6xl">
            YOUR NEXT MASTERPIECE<br />
            <span style={{ color: '#7c3aed' }}>STARTS HERE</span>
          </h2>
          <p className="mt-5 text-lg text-[#7a7898]">
            Join miniature painters who track their work, grow their skills,
            and share their passion on Paintpile.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 rounded-xl px-10 py-4 text-base font-bold text-white transition-all hover:bg-[#6d28d9] hover:scale-[1.02]"
              style={{ background: '#7c3aed', boxShadow: '0 0 40px rgba(124,58,237,.4)' }}
            >
              Create Your Free Account →
            </Link>
          </div>
          <p className="mt-3 text-sm text-[#3e3c58]">Free forever · No credit card · Cancel Pro anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[.05] px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between">
          <span className="font-bebas text-lg tracking-[.06em] text-[#3e3c58]">PAINTPILE</span>
          <div className="flex gap-6 text-sm text-[#3e3c58]">
            <Link href="/privacy" className="hover:text-[#7a7898]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#7a7898]">Terms</Link>
            <Link href="/auth/signup" className="hover:text-[#7a7898]">Sign Up</Link>
          </div>
          <span className="text-xs text-[#3e3c58]">© 2026 Paintpile</span>
        </div>
      </footer>

    </div>
  );
}
