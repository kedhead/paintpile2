'use client';

import { SiteHeader } from '../../components/site-header';
import { usePresence } from '../../hooks/use-presence';
import { WelcomeBackModal } from '../../components/welcome-back/welcome-back-modal';
import { OnboardingModal } from '../../components/onboarding/onboarding-modal';
import { InstallPrompt } from '../../components/pwa/install-prompt';
import { ServiceWorkerRegister } from '../../components/sw-register';

// One shell for everyone. Public pages (gallery, projects, profiles, painters,
// paints, posts, challenges) render the same for visitors and members;
// private pages are gated in middleware.ts.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  usePresence();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
      </main>

      <OnboardingModal />
      <WelcomeBackModal />
      <InstallPrompt />
      <ServiceWorkerRegister />
    </div>
  );
}
