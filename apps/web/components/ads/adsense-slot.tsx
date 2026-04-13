'use client';

import { useEffect, useRef } from 'react';

interface AdSenseSlotProps {
  className?: string;
}

const AD_CLIENT = 'ca-pub-6982317762994922';
const AD_SLOT = '3897740370';

export function AdSenseSlot({ className }: AdSenseSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className || ''}`}
      style={{ display: 'block' }}
      data-ad-format="fluid"
      data-ad-layout-key="-fb+5w+4e-db+86"
      data-ad-client={AD_CLIENT}
      data-ad-slot={AD_SLOT}
    />
  );
}
