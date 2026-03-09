'use client';

import { useState, useCallback } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useRoomContext,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { useAuth } from '../../auth-provider';
import { VoiceParticipant } from './voice-participant';
import { ScreenShareTile } from './screen-share-tile';
import { VoiceControls } from './voice-controls';

interface VoiceChannelProps {
  groupId: string;
  channelId: string;
  channelName: string;
}

export function VoiceChannel({ groupId, channelId, channelName }: VoiceChannelProps) {
  const { pb } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const connect = useCallback(async () => {
    if (!livekitUrl) return;
    setConnecting(true);
    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          channelId,
          pbToken: pb.authStore.token,
        }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
      }
    } finally {
      setConnecting(false);
    }
  }, [groupId, channelId, pb.authStore.token, livekitUrl]);

  if (!livekitUrl) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Voice chat is not configured. Set NEXT_PUBLIC_LIVEKIT_URL to enable.
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-1">{channelName}</h3>
          <p className="text-sm text-muted-foreground">Click to join this voice channel</p>
        </div>
        <button
          onClick={connect}
          disabled={connecting}
          className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {connecting ? 'Connecting...' : 'Join Voice'}
        </button>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={livekitUrl}
      token={token}
      connect={true}
      video={false}
      audio={true}
      onDisconnected={() => setToken(null)}
      className="flex flex-1 flex-col"
    >
      <RoomAudioRenderer />
      <VoiceRoomContent channelName={channelName} onDisconnect={() => setToken(null)} />
    </LiveKitRoom>
  );
}

function VoiceRoomContent({
  channelName,
  onDisconnect,
}: {
  channelName: string;
  onDisconnect: () => void;
}) {
  const participants = useParticipants();
  const room = useRoomContext();

  // Find participants who are screen sharing
  const screenSharers = participants.filter((p) => {
    const pub = p.getTrackPublication(Track.Source.ScreenShare);
    return pub && !pub.isMuted;
  });

  // Check if anyone has video on (to adjust grid)
  const anyVideoOn = participants.some((p) => {
    const pub = p.getTrackPublication(Track.Source.Camera);
    return pub && !pub.isMuted;
  });

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-semibold text-foreground">{channelName}</h3>
        <p className="text-xs text-muted-foreground">{participants.length} connected</p>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Screen shares shown large at top */}
        {screenSharers.length > 0 && (
          <div className="space-y-3 mb-4">
            {screenSharers.map((p) => (
              <ScreenShareTile key={`screen-${p.identity}`} participant={p} />
            ))}
          </div>
        )}

        {/* Participant grid — adapts to video mode */}
        <div className={`grid gap-3 ${
          anyVideoOn
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
        }`}>
          {participants.map((participant) => (
            <VoiceParticipant key={participant.identity} participant={participant} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <VoiceControls room={room} onDisconnect={onDisconnect} />
    </div>
  );
}
