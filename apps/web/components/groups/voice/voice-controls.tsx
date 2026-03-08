'use client';

import { useState } from 'react';
import { Mic, MicOff, Headphones, HeadphoneOff, PhoneOff } from 'lucide-react';
import type { Room } from 'livekit-client';

interface VoiceControlsProps {
  room: Room;
  onDisconnect: () => void;
}

export function VoiceControls({ room, onDisconnect }: VoiceControlsProps) {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);

  const toggleMute = async () => {
    await room.localParticipant.setMicrophoneEnabled(muted);
    setMuted(!muted);
  };

  const toggleDeafen = async () => {
    // When deafening, also mute
    if (!deafened) {
      await room.localParticipant.setMicrophoneEnabled(false);
      setMuted(true);
    } else {
      await room.localParticipant.setMicrophoneEnabled(true);
      setMuted(false);
    }
    setDeafened(!deafened);
  };

  const disconnect = () => {
    room.disconnect();
    onDisconnect();
  };

  return (
    <div className="flex items-center justify-center gap-3 border-t border-border bg-background px-4 py-3">
      <button
        onClick={toggleMute}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          muted ? 'bg-red-100 text-red-600' : 'bg-muted text-foreground hover:bg-muted'
        }`}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>

      <button
        onClick={toggleDeafen}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          deafened ? 'bg-red-100 text-red-600' : 'bg-muted text-foreground hover:bg-muted'
        }`}
        title={deafened ? 'Undeafen' : 'Deafen'}
      >
        {deafened ? <HeadphoneOff className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
      </button>

      <button
        onClick={disconnect}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
        title="Disconnect"
      >
        <PhoneOff className="h-5 w-5" />
      </button>
    </div>
  );
}
