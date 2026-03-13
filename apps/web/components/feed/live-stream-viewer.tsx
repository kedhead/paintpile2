'use client';

import { useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useParticipants,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track, type RemoteParticipant } from 'livekit-client';
import { X, Radio, Eye, Volume2, VolumeX } from 'lucide-react';

interface LiveStreamViewerProps {
  livekitUrl: string;
  token: string;
  streamerName: string;
  title: string;
  onLeave: () => void;
}

export function LiveStreamViewer({
  livekitUrl,
  token,
  streamerName,
  title,
  onLeave,
}: LiveStreamViewerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl">
        <LiveKitRoom
          serverUrl={livekitUrl}
          token={token}
          connect={true}
          video={false}
          audio={false}
          onDisconnected={onLeave}
          className="flex flex-1 flex-col"
        >
          <RoomAudioRenderer />
          <ViewerContent
            streamerName={streamerName}
            title={title}
            onLeave={onLeave}
          />
        </LiveKitRoom>
      </div>
    </div>
  );
}

function ViewerContent({
  streamerName,
  title,
  onLeave,
}: {
  streamerName: string;
  title: string;
  onLeave: () => void;
}) {
  const participants = useParticipants();
  const [muted, setMuted] = useState(false);
  const viewerCount = Math.max(0, participants.length - 1);

  // Find the broadcaster (first remote participant with video)
  const broadcaster = participants.find(
    (p) => p !== participants[0] || participants.length === 1
  ) as RemoteParticipant | undefined;

  // Try to find screen share first, then camera
  const screenTrack = broadcaster
    ? Array.from(broadcaster.trackPublications.values()).find(
        (pub) => pub.source === Track.Source.ScreenShare && !pub.isMuted && pub.track
      )
    : undefined;

  const cameraTrack = broadcaster
    ? Array.from(broadcaster.trackPublications.values()).find(
        (pub) => pub.source === Track.Source.Camera && !pub.isMuted && pub.track
      )
    : undefined;

  const activeTrack = screenTrack || cameraTrack;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
            <Radio className="h-3 w-3" />
            LIVE
          </span>
          <span className="text-sm font-semibold text-foreground">{streamerName}</span>
          <span className="text-sm text-muted-foreground">— {title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            {viewerCount}
          </span>
          <button
            onClick={onLeave}
            className="rounded-full bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-red-500/20 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Video area */}
      <div className="relative aspect-video bg-black">
        {activeTrack?.track && broadcaster ? (
          <VideoTrack
            trackRef={{
              participant: broadcaster,
              publication: activeTrack,
              source: activeTrack.source as Track.Source,
            }}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Radio className="h-10 w-10 animate-pulse text-red-400" />
            <p className="text-sm">Waiting for the stream to start...</p>
            <p className="text-xs text-muted-foreground/60">The broadcaster may be setting up their camera</p>
          </div>
        )}
      </div>

      {/* Simple controls bar */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <button
          onClick={() => setMuted(!muted)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
            muted ? 'bg-red-500/10 text-red-400' : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? 'Unmute' : 'Mute'}
        </button>

        <button
          onClick={onLeave}
          className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Leave Stream
        </button>
      </div>
    </div>
  );
}
