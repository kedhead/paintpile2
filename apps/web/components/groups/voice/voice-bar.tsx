'use client';

import { PhoneOff, Mic, MicOff } from 'lucide-react';

interface VoiceBarProps {
  channelName: string;
  groupName: string;
  muted: boolean;
  onToggleMute: () => void;
  onDisconnect: () => void;
}

export function VoiceBar({ channelName, groupName, muted, onToggleMute, onDisconnect }: VoiceBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-border bg-card px-4 py-2 text-white">
      <div className="min-w-0">
        <p className="text-sm font-medium text-green-400 truncate">Connected to voice</p>
        <p className="text-xs text-muted-foreground truncate">
          {groupName} / {channelName}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            muted ? 'bg-red-500' : 'bg-muted hover:bg-background0'
          }`}
        >
          {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <button
          onClick={onDisconnect}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 hover:bg-red-600"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
