'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function MobileCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Forward all OAuth params to the mobile app via deep link
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
      const params = new URLSearchParams();
      params.set('code', code);
      if (state) params.set('state', state);

      // Redirect to the mobile app's deep link
      window.location.href = `paintpile://oauth?${params.toString()}`;
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-lg text-foreground">Redirecting to PaintPile app...</p>
        <p className="mt-2 text-sm text-muted-foreground">
          If the app doesn&apos;t open automatically,{' '}
          <a
            href={`paintpile://oauth?${searchParams.toString()}`}
            className="text-primary underline"
          >
            tap here
          </a>
        </p>
      </div>
    </div>
  );
}

export default function MobileCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-foreground">Loading...</p>
        </div>
      }
    >
      <MobileCallbackContent />
    </Suspense>
  );
}
