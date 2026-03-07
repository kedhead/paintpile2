'use client';

import { Volume2 } from 'lucide-react';

interface VoiceStatusProps {
  connectedCount: number;
}

export function VoiceStatus({ connectedCount }: VoiceStatusProps) {
  if (connectedCount === 0) return null;

  return (
    <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
      <Volume2 className="h-3 w-3" />
      {connectedCount}
    </span>
  );
}
