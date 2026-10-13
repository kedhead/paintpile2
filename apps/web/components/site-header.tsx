'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Crown, Hammer, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from './auth-provider';
import { NotificationBell } from './notifications/notification-bell';
import { UserAvatar } from './social/user-avatar';
import { ThemeToggle } from './theme-toggle';
import { profilePath } from '../lib/urls';

// ── Navigation model ─────────────────────────────────────────────────────────
// Five public tabs anyone can browse. Personal tools live under "Workshop",
// which only appears once you're signed in.
export const PRIMARY_TABS = [
  { href: '/',           label: 'Projects' },
  { href: '/feed',       label: 'Posts' },
  { href: '/challenges', label: 'Challenges' },
  { href: '/painters',   label: 'Painters' },
  { href: '/paints',     label: 'Paints' },
];

export const WORKSHOP_TABS = [
  { href: '/home',         label: 'Overview' },
  { href: '/projects',     label: 'My Projects' },
  { href: '/pile',         label: 'Pile' },
  { href: '/recipes',      label: 'Recipes' },
  { href: '/tools',        label: 'Tools' },
  { href: '/diary',        label: 'Diary' },
  { href: '/palette-post', label: 'Palette Post' },
  { href: '/dashboard',    label: 'Stats' },
  { href: '/badges',       label: 'Badges' },
];

function tabIsActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/projects') return pathname === '/projects' || pathname.startsWith('/projects/armies');
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isWorkshopRoute(pathname: string | null): boolean {
  return !!pathname && WORKSHOP_TABS.some((t) => tabIsActive(t.href, pathname));
}

function TabLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative whitespace-nowrap px-3 py-2 text-sm transition-colors ${
        active ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
      {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
    </Link>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;

  const item = 'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center rounded-full ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <UserAvatar user={user} size="sm" />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-foreground">{user.name || user.username}</p>
            {user.username && <p className="truncate text-xs text-muted-foreground">@{user.username}</p>}
          </div>
          <div className="my-1 h-px bg-border" />
          <Link href={profilePath(user)} className={item}><User className="h-4 w-4" />Your profile</Link>
          <Link href="/home" className={item}><Hammer className="h-4 w-4" />Workshop</Link>
          <Link href="/settings/account" className={item}><Settings className="h-4 w-4" />Settings</Link>
          {user.subscription !== 'pro' && (
            <Link href="/settings/subscription" className={item}><Crown className="h-4 w-4 text-amber-500" />Go Pro</Link>
          )}
          <div className="my-1 h-px bg-border" />
          <button onClick={signOut} className={`${item} w-full`}><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const { user, loading } = useAuth();
  const pathname = usePathname() || '/';
  const inWorkshop = isWorkshopRoute(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <img src="/logosmall.png" alt="" className="h-8 w-auto" />
          <span className="font-bebas text-2xl leading-none tracking-wide text-foreground">Paintpile</span>
        </Link>

        <nav className="hidden items-center md:flex" aria-label="Main">
          {PRIMARY_TABS.map((t) => (
            <TabLink key={t.href} {...t} active={tabIsActive(t.href, pathname)} />
          ))}
        </nav>

        <div className="flex-1" />

        {loading ? null : user ? (
          <div className="flex items-center gap-1">
            <Link
              href="/home"
              className={`hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium sm:flex ${
                inWorkshop ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Hammer className="h-4 w-4" />
              Workshop
            </Link>
            <ThemeToggle />
            <NotificationBell />
            <UserMenu />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth/login" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link href="/auth/signup" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/85">
              Join free
            </Link>
          </div>
        )}
      </div>

      {/* Mobile: primary tabs scroll horizontally under the logo row */}
      <nav className="flex overflow-x-auto px-2 md:hidden" aria-label="Main">
        {PRIMARY_TABS.map((t) => (
          <TabLink key={t.href} {...t} active={tabIsActive(t.href, pathname)} />
        ))}
        {user && <TabLink href="/home" label="Workshop" active={inWorkshop} />}
      </nav>

      {inWorkshop && user && (
        <nav className="border-t border-border" aria-label="Workshop">
          <div className="mx-auto flex max-w-7xl overflow-x-auto px-2 md:px-4">
            {WORKSHOP_TABS.map((t) => (
              <TabLink key={t.href} {...t} active={tabIsActive(t.href, pathname)} />
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
