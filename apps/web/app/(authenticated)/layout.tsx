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
import { Home, Hammer, Palette, Users, Settings, User } from 'lucide-react';

// ── Navigation model ─────────────────────────────────────────────────────────
// Five hubs. Everything in the app lives inside one of them, reachable in
// two taps: hub (sidebar / bottom bar) → tab (horizontal sub-nav).
interface SectionTab {
  href: string;
  label: string;
}

interface Section {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  href: string;
  tabs: SectionTab[];
}

const SECTIONS: Section[] = [
  {
    key: 'home',
    label: 'Home',
    icon: Home,
    href: '/home',
    tabs: [],
  },
  {
    key: 'workshop',
    label: 'Workshop',
    icon: Hammer,
    href: '/projects',
    tabs: [
      { href: '/projects',  label: 'Projects' },
      { href: '/pile',      label: 'Pile' },
      { href: '/diary',     label: 'Diary' },
      { href: '/dashboard', label: 'Stats' },
      { href: '/badges',    label: 'Badges' },
    ],
  },
  {
    key: 'studio',
    label: 'Studio',
    icon: Palette,
    href: '/paints',
    tabs: [
      { href: '/paints',       label: 'Paints' },
      { href: '/recipes',      label: 'Recipes' },
      { href: '/tools',        label: 'Tools' },
      { href: '/palette-post', label: 'Palette Post' },
    ],
  },
  {
    key: 'community',
    label: 'Community',
    icon: Users,
    href: '/feed',
    tabs: [
      { href: '/feed',       label: 'Showcase' },
      { href: '/challenges', label: 'Challenges' },
      { href: '/groups',     label: 'Groups' },
      { href: '/news',       label: 'News' },
    ],
  },
];

function sectionIsActive(section: Section, pathname: string | null): boolean {
  if (!pathname) return false;
  if (section.key === 'home') return pathname === '/home' || pathname === '/';
  return section.tabs.some((t) => pathname.startsWith(t.href));
}

function activeSection(pathname: string | null): Section | undefined {
  return SECTIONS.find((s) => sectionIsActive(s, pathname));
}

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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 10,
        padding: collapsed ? '13px 0' : '11px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: active ? 'rgba(124,58,237,.12)' : 'transparent',
        color: active ? '#a78bfa' : 'rgba(122,120,152,1)',
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
      <div style={{ flex: 1 }}>
        {SECTIONS.map(section => (
          <SideNavItem
            key={section.key}
            href={section.href}
            label={section.label}
            icon={section.icon}
            collapsed={collapsed}
            active={sectionIsActive(section, pathname)}
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

// ── Section tabs (horizontal sub-nav within a hub) ───────────────────────────
function SectionTabs({ section, pathname }: { section: Section; pathname: string | null }) {
  return (
    <div
      className="-mx-4 mb-5 overflow-x-auto px-4 md:mx-0 md:px-0"
      style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}
    >
      <div className="flex gap-1" style={{ minWidth: 'max-content' }}>
        {section.tabs.map(({ href, label }) => {
          const active = !!pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                padding: '10px 14px',
                fontSize: 13,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: active ? 700 : 500,
                color: active ? '#a78bfa' : 'rgba(122,120,152,1)',
                borderBottom: `2px solid ${active ? '#7c3aed' : 'transparent'}`,
                marginBottom: -1,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'color .15s',
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Mobile bottom nav ────────────────────────────────────────────────────────
function MobileBottomNav({ pathname }: { pathname: string | null }) {
  const profileActive = !!pathname && (pathname.startsWith('/profile') || pathname.startsWith('/settings'));

  const items = [
    ...SECTIONS.map(s => ({
      href: s.href,
      label: s.label,
      icon: s.icon,
      active: sectionIsActive(s, pathname),
    })),
    { href: '/profile', label: 'Profile', icon: User, active: profileActive },
  ];

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
      {items.map(({ href, label, icon: Icon, active }) => (
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
            color: active ? '#a78bfa' : 'rgba(122,120,152,1)',
            textDecoration: 'none',
            transition: 'color .15s',
          }}
        >
          <Icon style={{ width: 19, height: 19, color: 'inherit' } as React.CSSProperties} />
          <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, fontFamily: 'DM Sans, sans-serif', letterSpacing: '.02em', textTransform: 'uppercase', color: 'inherit' }}>
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}

// ── Layout ───────────────────────────────────────────────────────────────────
export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGroupsRoute = pathname?.startsWith('/groups');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  usePresence();

  const section = activeSection(pathname);
  // Groups keeps its full-bleed chat layout; every other tabbed route gets
  // the hub sub-nav above its content.
  const showTabs = !!section && section.tabs.length > 0 && !isGroupsRoute;

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
              {showTabs && <SectionTabs section={section} pathname={pathname} />}
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
