'use client';

import { useState } from 'react';
import {
  Mic, MicOff, Headphones, HeadphoneOff, PhoneOff,
  Video, VideoOff, Monitor, MonitorOff,
} from 'lucide-react';
import type { Room } from 'livekit-client';

interface VoiceControlsProps {
  room: Room;
  onDisconnect: () => void;
}

export function VoiceControls({ room, onDisconnect }: VoiceControlsProps) {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);

  const toggleMute = async () => {
    await room.localParticipant.setMicrophoneEnabled(muted);
    setMuted(!muted);
  };

  const toggleDeafen = async () => {
    if (!deafened) {
      await room.localParticipant.setMicrophoneEnabled(false);
      setMuted(true);
    } else {
      await room.localParticipant.setMicrophoneEnabled(true);
      setMuted(false);
    }
    setDeafened(!deafened);
  };

  const toggleCamera = async () => {
    await room.localParticipant.setCameraEnabled(!cameraOn);
    setCameraOn(!cameraOn);
  };

  const toggleScreenShare = async () => {
    try {
      await room.localParticipant.setScreenShareEnabled(!screenOn);
      setScreenOn(!screenOn);
    } catch {
      // User cancelled screen share picker
    }
  };

  const disconnect = () => {
    room.disconnect();
    onDisconnect();
  };

  return (
    <div className="flex items-center justify-center gap-2 border-t border-border bg-background px-4 py-3">
      <button
        onClick={toggleMute}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          muted ? 'bg-red-900/30 text-red-400' : 'bg-muted text-foreground hover:bg-muted/80'
        }`}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>

      <button
        onClick={toggleDeafen}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          deafened ? 'bg-red-900/30 text-red-400' : 'bg-muted text-foreground hover:bg-muted/80'
        }`}
        title={deafened ? 'Undeafen' : 'Deafen'}
      >
        {deafened ? <HeadphoneOff className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
      </button>

      <button
        onClick={toggleCamera}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          cameraOn ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground hover:bg-muted/80'
        }`}
        title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
      >
        {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </button>

      <button
        onClick={toggleScreenShare}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          screenOn ? 'bg-blue-600/20 text-blue-400' : 'bg-muted text-foreground hover:bg-muted/80'
        }`}
        title={screenOn ? 'Stop sharing' : 'Share screen'}
      >
        {screenOn ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
      </button>

      <div className="mx-1 h-6 w-px bg-border" />

      <button
        onClick={disconnect}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
        title="Disconnect"
      >
        <PhoneOff className="h-5 w-5" />
      </button>
    </div>
  );
}
