'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Bell } from 'lucide-react';

const settingsNav = [
  { href: '/settings/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex gap-2 border-b border-border">
        {settingsNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              pathname === href
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
