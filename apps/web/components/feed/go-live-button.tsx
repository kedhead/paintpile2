'use client';

import { useState, useCallback } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useParticipants,
  useRoomContext,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import {
  Radio, Loader2, Camera, CameraOff, Mic, MicOff,
  Monitor, MonitorOff, PhoneOff,
} from 'lucide-react';
import { useAuth } from '../auth-provider';
import { useStartStream, useStopStream } from '../../hooks/use-live-streams';

export function GoLiveButton() {
  const { user, pb } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [streamId, setStreamId] = useState<string | null>(null);
  const startStream = useStartStream();
  const stopStream = useStopStream();
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const handleGoLive = useCallback(async () => {
    if (!livekitUrl || !user) return;

    try {
      // Create stream record
      const stream = await startStream.mutateAsync({
        title: title || 'Live painting session',
      });
      setStreamId(stream.id);

      // Get LiveKit token
      const res = await fetch('/api/livekit/feed-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamerId: user.id,
          pbToken: pb.authStore.token,
          role: 'broadcaster',
        }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
      }
    } catch (err) {
      console.error('Failed to start stream:', err);
    }
  }, [livekitUrl, user, title, pb.authStore.token, startStream]);

  const handleStopLive = useCallback(async () => {
    if (streamId) {
      await stopStream.mutateAsync(streamId);
    }
    setToken(null);
    setStreamId(null);
    setTitle('');
    setShowModal(false);
  }, [streamId, stopStream]);

  if (!user || !livekitUrl) return null;

  // If actively streaming, show the broadcast UI
  if (token && showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
        <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl">
          <LiveKitRoom
            serverUrl={livekitUrl}
            token={token}
            connect={true}
            video={true}
            audio={true}
            onDisconnected={handleStopLive}
            className="flex flex-1 flex-col"
          >
            <RoomAudioRenderer />
            <BroadcastView
              title={title || 'Live painting session'}
              onStop={handleStopLive}
            />
          </LiveKitRoom>
        </div>
      </div>
    );
  }

  // Pre-broadcast modal
  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowModal(false)}>
        <div
          className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-4">
            <Radio className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold text-foreground">Go Live</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Stream Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you painting?"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={200}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Your camera and microphone will be enabled when you go live.
              Viewers from the feed can watch your painting session in real-time.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setShowModal(false)}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleGoLive}
              disabled={startStream.isPending}
              className="flex items-center gap-2 rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {startStream.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Radio className="h-4 w-4" />
              )}
              Go Live
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Go Live button for the feed
  return (
    <button
      onClick={() => setShowModal(true)}
      className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/20"
    >
      <Radio className="h-4 w-4" />
      Go Live
    </button>
  );
}

function BroadcastView({
  title,
  onStop,
}: {
  title: string;
  onStop: () => void;
}) {
  const room = useRoomContext();
  const participants = useParticipants();
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);

  const localParticipant = room.localParticipant;
  const cameraTrack = localParticipant.getTrackPublication(Track.Source.Camera);
  const screenTrack = localParticipant.getTrackPublication(Track.Source.ScreenShare);
  const viewerCount = Math.max(0, participants.length - 1);

  const toggleMute = async () => {
    await localParticipant.setMicrophoneEnabled(muted);
    setMuted(!muted);
  };

  const toggleCamera = async () => {
    await localParticipant.setCameraEnabled(!cameraOn);
    setCameraOn(!cameraOn);
  };

  const toggleScreen = async () => {
    try {
      await localParticipant.setScreenShareEnabled(!screenOn);
      setScreenOn(!screenOn);
    } catch {
      // User cancelled screen share
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
            <Radio className="h-3 w-3" />
            LIVE
          </span>
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Video area */}
      <div className="relative aspect-video bg-black">
        {screenTrack?.track && !screenTrack.isMuted ? (
          <VideoTrack
            trackRef={{ participant: localParticipant, publication: screenTrack, source: Track.Source.ScreenShare }}
            className="h-full w-full object-contain"
          />
        ) : cameraTrack?.track && !cameraTrack.isMuted ? (
          <VideoTrack
            trackRef={{ participant: localParticipant, publication: cameraTrack, source: Track.Source.Camera }}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <CameraOff className="h-12 w-12" />
          </div>
        )}
      </div>

      {/* Controls */}
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
          onClick={toggleCamera}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
            cameraOn ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
          title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {cameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
        </button>

        <button
          onClick={toggleScreen}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
            screenOn ? 'bg-blue-600/20 text-blue-400' : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
          title={screenOn ? 'Stop sharing' : 'Share screen'}
        >
          {screenOn ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </button>

        <div className="mx-1 h-6 w-px bg-border" />

        <button
          onClick={onStop}
          className="flex h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700"
          title="End stream"
        >
          <PhoneOff className="h-4 w-4" />
          End Stream
        </button>
      </div>
    </div>
  );
}
