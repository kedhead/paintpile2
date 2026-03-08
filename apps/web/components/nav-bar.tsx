'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-provider';
import {
  Home, User, Palette, LogOut, Users, Shield,
  ChefHat, Boxes, Sun, MoreHorizontal,
} from 'lucide-react';
import { NotificationBell } from './notifications/notification-bell';

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
  { href: '/tools/lighting-ref', label: 'Lighting', icon: Sun },
  { href: '/profile', label: 'Profile', icon: User },
];

export function NavBar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  if (!user) return null;

  const isMoreActive = moreNavItems.some(({ href }) => pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/feed" className="text-xl font-bold text-foreground">
          Paint<span className="text-primary">pile</span>
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
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-card py-1 shadow-lg">
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
                </div>
              </>
            )}
          </div>

          <NotificationBell />

          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
