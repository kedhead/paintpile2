import Link from 'next/link';
import Image from 'next/image';

const LINK_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Sign In', href: '/auth/login' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Sign Up', href: '/auth/signup' },
      { label: 'RSS Feed', href: '/feed.xml' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/5 px-6 py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <Image src="/logo-64.png" alt="Paintpile" width={44} height={24} className="h-6 w-auto opacity-70" />
            <span className="font-bebas text-lg tracking-[.06em] text-ink-muted">PAINTPILE</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-subtle">
            The all-in-one platform for tabletop miniature painters.
            Track, paint, share.
          </p>
        </div>
        {LINK_COLUMNS.map((column) => (
          <div key={column.title}>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-[.1em] text-ink-subtle">
              {column.title}
            </h4>
            <ul className="space-y-2">
              {column.links.map((link) =>
                <li key={link.label}>
                  {link.href.startsWith('#') ? (
                    <a href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                      {link.label}
                    </Link>
                  )}
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-5xl border-t border-white/5 pt-6 text-center text-xs text-ink-subtle">
        © 2026 Paintpile
      </div>
    </footer>
  );
}
