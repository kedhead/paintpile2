'use client';

import { useEffect, useRef } from 'react';

interface AdSenseSlotProps {
  className?: string;
}

export function AdSenseSlot({ className }: AdSenseSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

  useEffect(() => {
    if (!clientId || !slotId) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded
    }
  }, [clientId, slotId]);

  if (!clientId || !slotId) return null;

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className || ''}`}
      style={{ display: 'block' }}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
