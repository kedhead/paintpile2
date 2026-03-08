'use client';

import { Mic, MicOff } from 'lucide-react';
import type { Participant } from 'livekit-client';

interface VoiceParticipantProps {
  participant: Participant;
}

export function VoiceParticipant({ participant }: VoiceParticipantProps) {
  const isMuted = !participant.isMicrophoneEnabled;
  const isSpeaking = participant.isSpeaking;
  const displayName = participant.name || participant.identity;

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-lg p-4 transition-colors ${
        isSpeaking ? 'bg-green-900/30 ring-2 ring-green-400' : 'bg-background'
      }`}
    >
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary text-xl font-bold">
          {displayName[0]?.toUpperCase()}
        </div>
        <div
          className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full ${
            isMuted ? 'bg-red-900/300' : 'bg-card'
          }`}
        >
          {isMuted ? (
            <MicOff className="h-3 w-3 text-white" />
          ) : (
            <Mic className="h-3 w-3 text-white" />
          )}
        </div>
      </div>
      <span className="text-xs font-medium text-foreground truncate max-w-full">{displayName}</span>
    </div>
  );
}
