'use client';

import { useRef, useEffect } from 'react';
import type { Participant } from 'livekit-client';
import { Track } from 'livekit-client';

interface ScreenShareTileProps {
  participant: Participant;
}

export function ScreenShareTile({ participant }: ScreenShareTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const displayName = participant.name || participant.identity;

  const screenPublication = participant.getTrackPublication(Track.Source.ScreenShare);
  const screenTrack = screenPublication?.track;

  useEffect(() => {
    const el = videoRef.current;
    const track = screenTrack;
    if (!el || !track) return;
    track.attach(el);
    return () => { track.detach(el); };
  }, [screenTrack]);

  if (!screenTrack) return null;

  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-h-[60vh] object-contain"
      />
      <div className="absolute bottom-2 left-2 rounded bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
        {displayName}&apos;s screen
      </div>
    </div>
  );
}
