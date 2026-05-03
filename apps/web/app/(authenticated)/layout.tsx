'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavBar } from '../../components/nav-bar';
import { usePresence } from '../../hooks/use-presence';
import { WelcomeBackModal } from '../../components/welcome-back/welcome-back-modal';
import { OnboardingModal } from '../../components/onboarding/onboarding-modal';
import { InstallPrompt } from '../../components/pwa/install-prompt';
import { ServiceWorkerRegister } from '../../components/sw-register';
import {
  Home, FolderOpen, Layers, Palette, Wrench, Settings,
  ChefHat, BookOpen, Trophy, Users, Newspaper, Award,
  LayoutDashboard, Image, Sun, Crosshair, Boxes,
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

// ── Sidebar nav item ─────────────────────────────────────────────────────────
function SideNavItem({
  href, label, icon: Icon, collapsed, active,
}: {
  href: string; label: string; icon: React.ComponentType<{ className?: string }>; collapsed: boolean; active: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 10,
        padding: collapsed ? '11px 0' : '9px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: active ? 'rgba(124,58,237,.12)' : 'transparent',
        color: active ? '#7c3aed' : 'rgba(122,120,152,1)',
        borderLeft: `2px solid ${active ? '#7c3aed' : 'transparent'}`,
        transition: 'all .15s',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: active ? 700 : 500,
        fontSize: 13,
        textDecoration: 'none',
        width: '100%',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)';
          (e.currentTarget as HTMLElement).style.color = '#f0eeff';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'rgba(122,120,152,1)';
        }
      }}
    >
      <Icon className="shrink-0" style={{ width: 17, height: 17, color: 'inherit' } as React.CSSProperties} />
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
      className="hidden md:flex flex-col shrink-0 border-r"
      style={{
        width: collapsed ? 56 : 200,
        background: '#0e0e16',
        borderRightColor: 'rgba(255,255,255,.05)',
        transition: 'width .2s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        padding: '8px 0',
      }}
    >
      {/* Primary nav */}
      <div style={{ flex: 1 }}>
        {PRIMARY_NAV.map(item => (
          <SideNavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            active={isActive(item.href)}
          />
        ))}

        {/* Divider + more items */}
        <div style={{ height: 1, background: 'rgba(255,255,255,.05)', margin: '8px 0' }} />
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
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: '8px', background: 'transparent', border: 'none',
            cursor: 'pointer', color: 'rgba(62,60,88,1)', fontSize: 16, lineHeight: 1,
            transition: 'color .15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(122,120,152,1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(62,60,88,1)'; }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>
    </aside>
  );
}

// ── Mobile bottom nav ────────────────────────────────────────────────────────
function MobileBottomNav({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed' || pathname === '/';
    return !!pathname?.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex md:hidden z-50 border-t"
      style={{
        height: 60,
        background: '#16161e',
        borderTopColor: 'rgba(255,255,255,.07)',
        boxShadow: '0 -4px 20px rgba(0,0,0,.4)',
      }}
    >
      {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              color: active ? '#7c3aed' : 'rgba(122,120,152,1)',
              textDecoration: 'none',
              transition: 'color .15s',
            }}
          >
            <Icon style={{ width: 19, height: 19, color: 'inherit' } as React.CSSProperties} />
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, fontFamily: 'DM Sans, sans-serif', letterSpacing: '.03em', textTransform: 'uppercase', color: 'inherit' }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

// ── Layout ───────────────────────────────────────────────────────────────────
export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGroupsRoute = pathname?.startsWith('/groups');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  usePresence();

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: '#0c0c10' }}>
      <NavBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} pathname={pathname} />

        <main
          className="flex-1 overflow-y-auto"
          style={{ background: '#0c0c10' }}
        >
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
