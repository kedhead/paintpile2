'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavBar } from '../../components/nav-bar';
import { usePresence } from '../../hooks/use-presence';
import { WelcomeBackModal } from '../../components/welcome-back/welcome-back-modal';
import { OnboardingModal } from '../../components/onboarding/onboarding-modal';
import { InstallPrompt } from '../../components/pwa/install-prompt';
import { ServiceWorkerRegister } from '../../components/sw-register';
import { cn } from '../../lib/cn';
import {
  Home, FolderOpen, Layers, Palette, Wrench, Settings,
  ChefHat, BookOpen, Trophy, Users, Newspaper, Award,
  LayoutDashboard, Image, Sun, Crosshair, Boxes, MoreHorizontal, X,
} from 'lucide-react';

// ── Navigation items ─────────────────────────────────────────────────────────
const PRIMARY_NAV = [
  { href: '/feed',     label: 'Feed',     icon: Home },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/pile',     label: 'Pile',     icon: Layers },
  { href: '/paints',   label: 'Paints',   icon: Palette },
  { href: '/tools',    label: 'Tools',    icon: Wrench },
];

const MORE_NAV = [
  { href: '/groups',        label: 'Groups',      icon: Users },
  { href: '/recipes',       label: 'Recipes',     icon: ChefHat },
  { href: '/diary',         label: 'Diary',       icon: BookOpen },
  { href: '/news',          label: 'News',        icon: Newspaper },
  { href: '/challenges',    label: 'Challenges',  icon: Trophy },
  { href: '/badges',        label: 'Badges',      icon: Award },
  { href: '/dashboard',     label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/palette-post',  label: 'Palette Post',icon: Image },
  { href: '/tools/lighting-ref',   label: 'Lighting Ref',  icon: Sun },
  { href: '/tools/color-matcher',  label: 'Color Matcher', icon: Crosshair },
  { href: '/tools/paint-mixer',    label: 'Paint Mixer',   icon: Boxes },
];

const SIDEBAR_COLLAPSED_KEY = 'pp-sidebar-collapsed';

// ── Sidebar nav item ─────────────────────────────────────────────────────────
function SideNavItem({
  href, label, icon: Icon, collapsed, active,
}: {
  href: string; label: string; icon: React.ComponentType<{ className?: string; size?: number }>; collapsed: boolean; active: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex w-full items-center whitespace-nowrap border-l-2 text-[13px] transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50',
        collapsed ? 'justify-center py-[11px]' : 'gap-2.5 px-3.5 py-[9px]',
        active
          ? 'border-primary bg-primary-soft font-bold text-primary-tint'
          : 'border-transparent font-medium text-ink-muted hover:bg-white/[.04] hover:text-ink',
      )}
    >
      <Icon className="shrink-0" size={17} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

// ── Sidebar (desktop) ────────────────────────────────────────────────────────
function Sidebar({ collapsed, setCollapsed, pathname }: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  pathname: string | null;
}) {
  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed' || pathname === '/';
    return !!pathname?.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col overflow-hidden border-r border-edge bg-surface-deep py-2 transition-[width] duration-200 md:flex',
        collapsed ? 'w-14' : 'w-[200px]',
      )}
    >
      {/* Primary nav */}
      <div className="flex-1">
        {PRIMARY_NAV.map(item => (
          <SideNavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            active={isActive(item.href)}
          />
        ))}

        {/* Divider + more items */}
        <div className="my-2 h-px bg-white/5" />
        {MORE_NAV.map(item => (
          <SideNavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            active={isActive(item.href)}
          />
        ))}
      </div>

      {/* Settings + collapse toggle */}
      <div>
        <SideNavItem
          href="/settings/account"
          label="Settings"
          icon={Settings}
          collapsed={collapsed}
          active={!!pathname?.startsWith('/settings')}
        />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full cursor-pointer items-center justify-center border-none bg-transparent p-2 text-base leading-none text-ink-subtle transition-colors hover:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>
    </aside>
  );
}

// ── Mobile bottom nav ────────────────────────────────────────────────────────
const MOBILE_NAV = [
  { href: '/feed',     label: 'Feed',     icon: Home },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/pile',     label: 'Pile',     icon: Layers },
  { href: '/paints',   label: 'Paints',   icon: Palette },
];

const MORE_DRAWER_ITEMS = [
  { href: '/groups',       label: 'Groups',       icon: Users },
  { href: '/recipes',      label: 'Recipes',      icon: ChefHat },
  { href: '/diary',        label: 'Diary',        icon: BookOpen },
  { href: '/news',         label: 'News',         icon: Newspaper },
  { href: '/challenges',   label: 'Challenges',   icon: Trophy },
  { href: '/badges',       label: 'Badges',       icon: Award },
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/palette-post', label: 'Palette Post', icon: Image },
  { href: '/tools',        label: 'Tools',        icon: Wrench },
  { href: '/settings/account', label: 'Settings', icon: Settings },
];

function MobileBottomNav({ pathname }: { pathname: string | null }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed' || pathname === '/';
    return !!pathname?.startsWith(href);
  };

  const moreActive = MORE_DRAWER_ITEMS.some(i => isActive(i.href));

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* More drawer */}
      <div
        className={cn(
          'fixed bottom-[60px] left-0 right-0 z-50 rounded-t-2xl border-t border-white/[.08] bg-surface px-4 pb-2 pt-3 shadow-[0_-8px_40px_rgba(0,0,0,.5)] transition-transform duration-250 md:hidden',
          drawerOpen ? 'translate-y-0' : 'translate-y-[110%]',
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="font-bebas text-lg tracking-[.06em] text-ink">MORE</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="cursor-pointer border-none bg-transparent p-1 text-ink-muted"
            aria-label="Close"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {MORE_DRAWER_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  'flex flex-col items-center gap-[5px] rounded-[10px] px-1 py-2.5',
                  active ? 'bg-primary-soft text-primary-tint' : 'text-ink-muted',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className={cn('text-center text-[11px] tracking-[.02em]', active ? 'font-bold' : 'font-medium')}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[60px] border-t border-edge bg-surface shadow-[0_-4px_20px_rgba(0,0,0,.4)] md:hidden">
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-[3px] transition-colors',
                active ? 'text-primary-tint' : 'text-ink-muted',
              )}
            >
              <Icon className="h-[19px] w-[19px]" />
              <span className={cn('text-[11px] uppercase tracking-[.03em]', active ? 'font-bold' : 'font-medium')}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setDrawerOpen(v => !v)}
          className={cn(
            'flex flex-1 cursor-pointer flex-col items-center justify-center gap-[3px] border-none bg-transparent transition-colors',
            moreActive || drawerOpen ? 'text-primary-tint' : 'text-ink-muted',
          )}
        >
          <MoreHorizontal className="h-[19px] w-[19px]" />
          <span className={cn('text-[11px] uppercase tracking-[.03em]', moreActive || drawerOpen ? 'font-bold' : 'font-medium')}>
            More
          </span>
        </button>
      </nav>
    </>
  );
}

// ── Layout ───────────────────────────────────────────────────────────────────
export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGroupsRoute = pathname?.startsWith('/groups');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Restore persisted collapse state after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1');
  }, []);

  const setCollapsed = (v: boolean) => {
    setSidebarCollapsed(v);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, v ? '1' : '0');
  };

  usePresence();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <NavBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setCollapsed} pathname={pathname} />

        <main className="flex-1 overflow-y-auto bg-background">
          {isGroupsRoute ? (
            children
          ) : (
            <div className="mx-auto max-w-7xl px-4 py-6 pb-20 md:pb-6">
              {children}
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav pathname={pathname} />

      <OnboardingModal />
      <WelcomeBackModal />
      <InstallPrompt />
      <ServiceWorkerRegister />
    </div>
  );
}
