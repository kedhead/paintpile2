'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-provider';
import {
  Home, User, Palette, LogOut, Users, Shield,
  ChefHat, Boxes, Sun, MoreHorizontal, Settings,
  Activity, BookOpen, Newspaper, Globe, BarChart3,
  Trophy, Award, Crosshair, LogIn, UserPlus, Crown,
  CreditCard,
} from 'lucide-react';
import { NotificationBell } from './notifications/notification-bell';
import { ThemeToggle } from './theme-toggle';

const mainNavItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/groups', label: 'Groups', icon: Users },
  { href: '/projects', label: 'Projects', icon: Palette },
];

const moreNavItems = [
  { href: '/armies', label: 'Armies', icon: Shield },
  { href: '/paints', label: 'Paints', icon: Palette },
  { href: '/recipes', label: 'Recipes', icon: ChefHat },
  { href: '/pile', label: 'Pile', icon: Boxes },
  { href: '/community', label: 'Community', icon: Globe },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/diary', label: 'Diary', icon: BookOpen },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/challenges', label: 'Challenges', icon: Trophy },
  { href: '/badges', label: 'Badges', icon: Award },
  { href: '/brag-board', label: 'Brag Board', icon: Award },
];

const toolsItems = [
  { href: '/tools/lighting-ref', label: 'Lighting Ref', icon: Sun },
  { href: '/tools/color-matcher', label: 'Color Matcher', icon: Crosshair },
  { href: '/tools/paint-mixer', label: 'Paint Mixer', icon: Palette },
];

const bottomItems = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/admin', label: 'Admin', icon: Settings },
];

export function NavBar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const allMoreItems = [...moreNavItems, ...toolsItems, ...bottomItems];
  const isMoreActive = allMoreItems.some(({ href }) => pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href={user ? '/feed' : '/'} className="flex items-center gap-2">
          <img src="/logosmall.png" alt="Paintpile" className="h-9 w-auto" />
        </Link>

        <nav className="flex items-center gap-1">
          {mainNavItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          {/* More dropdown */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isMoreActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">More</span>
            </button>

            {moreOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMoreOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 max-h-[70vh] w-52 overflow-y-auto rounded-md border border-border bg-card py-1 shadow-lg">
                  {moreNavItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Link>
                    );
                  })}

                  <div className="my-1 border-t border-border" />
                  <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tools</p>
                  {toolsItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Link>
                    );
                  })}

                  {user && (
                    <>
                      <div className="my-1 border-t border-border" />
                      {bottomItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname.startsWith(href);
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setMoreOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {label}
                          </Link>
                        );
                      })}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <ThemeToggle />

          {user ? (
            <>
              {user.subscription === 'pro' && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-500">
                  <Crown className="h-3 w-3" />
                  PRO
                </span>
              )}
              <NotificationBell />
              <button
                onClick={signOut}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/80"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Up</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
