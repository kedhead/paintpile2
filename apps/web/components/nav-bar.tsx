'use client';

import Link from 'next/link';
import { useAuth } from './auth-provider';
import { Crown, LogIn, UserPlus, LogOut } from 'lucide-react';
import { NotificationBell } from './notifications/notification-bell';
import { UserAvatar } from './social/user-avatar';

export function NavBar() {
  const { user, signOut } = useAuth();

  return (
    <header
      className="sticky top-0 z-50 flex items-center border-b"
      style={{
        height: 52,
        background: '#0e0e16',
        borderBottomColor: 'rgba(255,255,255,.07)',
        boxShadow: '0 1px 0 rgba(124,58,237,.08)',
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link href={user ? '/feed' : '/'} className="flex items-center gap-2.5 shrink-0">
        <img src="/logosmall.png" alt="Paintpile" style={{ height: 30, width: 'auto' }} />
        <span
          className="hidden sm:block"
          style={{
            fontFamily: '"Bebas Neue", cursive',
            fontSize: 20,
            letterSpacing: '.06em',
            color: '#f0eeff',
            opacity: .9,
            lineHeight: 1,
            marginTop: 1,
          }}
        >
          PAINTPILE
        </span>
      </Link>

      <div className="flex-1" />

      {/* Search (desktop only, decorative) */}
      {user && (
        <div className="relative hidden md:block w-44">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(122,120,152,.6)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            placeholder="Search…"
            readOnly
            style={{
              width: '100%', padding: '7px 12px 7px 30px',
              background: '#111118', border: '1px solid rgba(255,255,255,.07)',
              borderRadius: 8, color: '#f0eeff', fontSize: 13, outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
        </div>
      )}

      {user ? (
        <div className="flex items-center gap-1.5">
          {user.subscription === 'pro' && (
            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'rgba(245,158,11,.15)', color: '#f59e0b' }}>
              <Crown className="h-3 w-3" />
              PRO
            </span>
          )}
          <NotificationBell />
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-all"
            style={{ color: 'rgba(122,120,152,1)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'; (e.currentTarget as HTMLElement).style.color = '#f0eeff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(122,120,152,1)'; }}
          >
            <UserAvatar user={user} size="xs" />
            <span className="hidden sm:inline max-w-[80px] truncate text-xs">
              {user.display_name || user.username || user.name || 'Profile'}
            </span>
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all"
            style={{ color: 'rgba(122,120,152,1)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'; (e.currentTarget as HTMLElement).style.color = '#f0eeff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(122,120,152,1)'; }}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
            style={{ color: 'rgba(122,120,152,1)' }}
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Login</span>
          </Link>
          <Link
            href="/auth/signup"
            className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-bold text-white transition-all"
            style={{ background: '#7c3aed', boxShadow: '0 0 20px rgba(124,58,237,.3)' }}
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Up</span>
          </Link>
        </div>
      )}
    </header>
  );
}
