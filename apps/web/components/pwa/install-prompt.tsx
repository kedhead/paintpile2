'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // iOS detection
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      setShowBanner(true);
      return;
    }

    // Android/Desktop
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', String(Date.now()));
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-md rounded-lg border border-border bg-card p-4 shadow-lg">
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <Smartphone className="h-8 w-8 flex-shrink-0 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Install Paintpile</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add Paintpile to your home screen for quick access and an app-like experience.
            </p>
            <button
              onClick={handleInstall}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/80"
            >
              <Download className="h-3.5 w-3.5" />
              Install App
            </button>
          </div>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-t-lg bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">Install on iOS</h3>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>1. Tap the Share button (box with arrow) in Safari</li>
              <li>2. Scroll down and tap &quot;Add to Home Screen&quot;</li>
              <li>3. Tap &quot;Add&quot; to confirm</li>
            </ol>
            <button
              onClick={() => {
                setShowIOSGuide(false);
                handleDismiss();
              }}
              className="mt-4 w-full rounded-lg bg-primary py-2 text-sm font-medium text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
