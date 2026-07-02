'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './auth-provider';
import { Crown, LogIn, UserPlus, LogOut } from 'lucide-react';
import { NotificationBell } from './notifications/notification-bell';
import { UserAvatar } from './social/user-avatar';
import { Badge } from './ui/badge';

const NAV_ITEM_CLASSES =
  'flex items-center rounded-lg text-ink-muted transition-colors hover:bg-white/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

export function NavBar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex h-[52px] shrink-0 items-center gap-3 border-b border-edge bg-surface-deep px-4">
      {/* Logo */}
      <Link href={user ? '/feed' : '/'} className="flex shrink-0 items-center gap-2.5">
        <Image src="/logo-64.png" alt="Paintpile" width={55} height={30} className="h-[30px] w-auto" />
        <span className="mt-px hidden font-bebas text-xl leading-none tracking-[.06em] text-ink/90 sm:block">
          PAINTPILE
        </span>
      </Link>

      <div className="flex-1" />

      {user ? (
        <div className="flex items-center gap-1.5">
          {user.subscription === 'pro' && (
            <Badge variant="pro">
              <Crown className="h-3 w-3" />
              PRO
            </Badge>
          )}
          <NotificationBell />
          <Link href="/profile" className={`${NAV_ITEM_CLASSES} gap-2 px-2.5 py-2.5 text-sm font-medium`}>
            <UserAvatar user={user} size="xs" />
            <span className="hidden max-w-[80px] truncate text-xs sm:inline">
              {user.display_name || user.username || user.name || 'Profile'}
            </span>
          </Link>
          <button
            onClick={signOut}
            className={`${NAV_ITEM_CLASSES} gap-1.5 px-2.5 py-2.5 text-xs font-medium`}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className={`${NAV_ITEM_CLASSES} gap-1.5 px-3 py-1.5 text-sm font-medium`}>
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Login</span>
          </Link>
          <Link
            href="/auth/signup"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-sm font-bold text-white shadow-glow-violet transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Up</span>
          </Link>
        </div>
      )}
    </header>
  );
}
