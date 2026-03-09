'use client';

import { useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Track } from 'livekit-client';
import type { Participant, TrackPublication } from 'livekit-client';

interface VoiceParticipantProps {
  participant: Participant;
}

export function VoiceParticipant({ participant }: VoiceParticipantProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMuted = !participant.isMicrophoneEnabled;
  const isSpeaking = participant.isSpeaking;
  const displayName = participant.name || participant.identity;

  // Find camera track
  const cameraPublication = participant.getTrackPublication(Track.Source.Camera);
  const cameraTrack = cameraPublication?.track;
  const hasVideo = !!cameraTrack && !cameraPublication?.isMuted;

  // Find screen share track
  const screenPublication = participant.getTrackPublication(Track.Source.ScreenShare);
  const screenTrack = screenPublication?.track;
  const hasScreen = !!screenTrack && !screenPublication?.isMuted;

  useEffect(() => {
    const el = videoRef.current;
    const track = cameraTrack;
    if (!el || !track) return;
    track.attach(el);
    return () => { track.detach(el); };
  }, [cameraTrack]);

  return (
    <div
      className={`relative flex flex-col items-center gap-2 rounded-lg p-3 transition-colors ${
        isSpeaking ? 'bg-green-900/30 ring-2 ring-green-400' : 'bg-background'
      }`}
    >
      <div className="relative w-full aspect-video flex items-center justify-center rounded-md overflow-hidden bg-muted/30">
        {hasVideo ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary text-xl font-bold">
            {displayName[0]?.toUpperCase()}
          </div>
        )}

        {/* Mic badge */}
        <div
          className={`absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full ${
            isMuted ? 'bg-red-600' : 'bg-black/50'
          }`}
        >
          {isMuted ? (
            <MicOff className="h-3 w-3 text-white" />
          ) : (
            <Mic className="h-3 w-3 text-white" />
          )}
        </div>

        {/* Screen share indicator */}
        {hasScreen && (
          <div className="absolute top-1.5 left-1.5 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Screen
          </div>
        )}
      </div>

      <span className="text-xs font-medium text-foreground truncate max-w-full">{displayName}</span>
    </div>
  );
}
