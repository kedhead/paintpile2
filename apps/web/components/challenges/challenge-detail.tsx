'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { Trophy, Clock, Users, Loader2, ThumbsUp, ImageIcon } from 'lucide-react';
import { getDisplayName } from '@paintpile/shared';
import {
  useChallenge,
  useChallengeEntries,
  useSubmitEntry,
  useVoteEntry,
  useUnvoteEntry,
  useMyVotes,
} from '../../hooks/use-challenges';
import { useMyProjects } from '../../hooks/use-projects';
import { useProjectPhotos } from '../../hooks/use-photos';
import { useAuth } from '../auth-provider';
import { getFileUrl, relativeTime, getAvatarUrl } from '../../lib/pb-helpers';

interface ChallengeDetailProps {
  challengeId: string;
}

function EntryPhotoPreview({ projectId }: { projectId: string }) {
  const { data: photos = [] } = useProjectPhotos(projectId);
  const latestPhoto = photos[0];

  if (!latestPhoto?.image) return null;

  return (
    <img
      src={getFileUrl(latestPhoto, latestPhoto.image, '400x400')}
      alt=""
      className="h-full w-full object-cover"
    />
  );
}

function ProjectPhotoSelector({
  projectId,
  selectedPhotoUrl,
  onSelect,
}: {
  projectId: string;
  selectedPhotoUrl: string | null;
  onSelect: (url: string) => void;
}) {
  const { data: photos = [] } = useProjectPhotos(projectId);

  if (photos.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No photos in this project yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Select a photo for your entry:</p>
      <div className="grid grid-cols-4 gap-2">
        {photos.slice(0, 8).map((photo) => {
          const url = getFileUrl(photo, photo.image, '200x200');
          const fullUrl = getFileUrl(photo, photo.image);
          const isSelected = selectedPhotoUrl === fullUrl;
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => onSelect(fullUrl)}
              className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                isSelected ? 'border-primary' : 'border-transparent hover:border-border'
              }`}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ChallengeDetail({ challengeId }: ChallengeDetailProps) {
  const { user } = useAuth();
  const { data: challenge, isLoading } = useChallenge(challengeId);
  const { data: entries = [] } = useChallengeEntries(challengeId);
  const { data: votedEntries } = useMyVotes(challengeId);
  const submitEntry = useSubmitEntry();
  const voteEntry = useVoteEntry();
  const unvoteEntry = useUnvoteEntry();
  const { data: projectsData } = useMyProjects();
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  const myProjects = projectsData?.pages.flatMap((p) => p.items) || [];
  const hasSubmitted = entries.some((e: RecordModel) => e.user === user?.id);
  const isActive = challenge?.status === 'active';
  const isVoting = challenge?.status === 'voting';
  const canVote = isVoting || challenge?.status === 'completed';

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!challenge) return <p className="text-muted-foreground">Challenge not found</p>;

  const handleSubmit = async () => {
    if (!selectedProject) return;
    const project = myProjects.find((p) => p.id === selectedProject);
    if (!project) return;
    await submitEntry.mutateAsync({
      challengeId,
      projectId: project.id,
      projectTitle: project.name,
      photoUrl: selectedPhotoUrl || undefined,
    });
    setShowSubmit(false);
    setSelectedProject('');
    setSelectedPhotoUrl(null);
  };

  const handleVote = (entryId: string) => {
    const hasVoted = votedEntries?.has(entryId);
    if (hasVoted) {
      unvoteEntry.mutate({ entryId, challengeId });
    } else {
      voteEntry.mutate({ entryId, challengeId });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h1 className="text-xl font-bold text-foreground">{challenge.title}</h1>
        </div>
        <p className="mt-2 text-sm text-foreground">{challenge.description}</p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {entries.length} entries
          </span>
          {challenge.end_date && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isActive
                ? `${Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / 86400000))} days left`
                : new Date(challenge.end_date).toLocaleDateString()}
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 font-semibold ${
              isActive
                ? 'bg-green-500/20 text-green-400'
                : isVoting
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {challenge.status}
          </span>
        </div>
      </div>

      {/* Submit button */}
      {isActive && !hasSubmitted && (
        <div>
          {!showSubmit ? (
            <button
              onClick={() => setShowSubmit(true)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
            >
              Submit Entry
            </button>
          ) : (
            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">Pick a project to submit</h3>
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setSelectedPhotoUrl(null);
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a project...</option>
                {myProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {selectedProject && (
                <ProjectPhotoSelector
                  projectId={selectedProject}
                  selectedPhotoUrl={selectedPhotoUrl}
                  onSelect={setSelectedPhotoUrl}
                />
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowSubmit(false);
                    setSelectedProject('');
                    setSelectedPhotoUrl(null);
                  }}
                  className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedProject || submitEntry.isPending}
                  className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
                >
                  {submitEntry.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {hasSubmitted && isActive && (
        <p className="text-xs text-green-400">You&apos;ve submitted your entry to this challenge!</p>
      )}

      {/* Entries gallery */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Entries {canVote && <span className="font-normal text-muted-foreground">— tap to vote</span>}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry: RecordModel) => {
              const hasVoted = votedEntries?.has(entry.id);
              const entryUser = entry.expand?.user;
              const avatarUrl = entryUser ? getAvatarUrl(entryUser) : null;

              return (
                <div
                  key={entry.id}
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  {/* Entry image */}
                  <div className="relative aspect-square bg-muted">
                    {entry.photo_url ? (
                      <img
                        src={entry.photo_url}
                        alt={entry.project_title}
                        className="h-full w-full object-cover"
                      />
                    ) : entry.project ? (
                      <EntryPhotoPreview projectId={entry.project} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}

                    {/* Vote count badge */}
                    {canVote && (
                      <button
                        onClick={() => handleVote(entry.id)}
                        disabled={voteEntry.isPending || unvoteEntry.isPending}
                        className={`absolute bottom-2 right-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-lg backdrop-blur-sm transition-colors disabled:opacity-50 ${
                          hasVoted
                            ? 'bg-primary text-white'
                            : 'bg-black/60 text-white hover:bg-primary/80'
                        }`}
                      >
                        <ThumbsUp className={`h-3 w-3 ${hasVoted ? 'fill-current' : ''}`} />
                        {entry.votes || 0}
                      </button>
                    )}
                  </div>

                  {/* Entry info */}
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="h-5 w-5 rounded-full" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium text-foreground">
                          {entry.project_title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          {entryUser ? getDisplayName(entryUser) : 'Unknown'} · {relativeTime(entry.created)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No entries yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}
