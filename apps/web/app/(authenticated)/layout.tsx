'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from '../../components/nav-bar';
import { usePresence } from '../../hooks/use-presence';
import { WelcomeBackModal } from '../../components/welcome-back/welcome-back-modal';
import { InstallPrompt } from '../../components/pwa/install-prompt';
import { PaintSplatterBg } from '../../components/paint-splatter-bg';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isGroupsRoute = pathname?.startsWith('/groups');

  // Track user presence
  usePresence();

  return (
    <div className="min-h-screen bg-background">
      <PaintSplatterBg />
      <NavBar />
      {isGroupsRoute ? (
        children
      ) : (
        <main className="relative z-10 mx-auto max-w-7xl px-4 py-6">{children}</main>
      )}
      <WelcomeBackModal />
      <InstallPrompt />
    </div>
  );
}
