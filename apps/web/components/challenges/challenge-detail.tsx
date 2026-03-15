'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import {
  Trophy,
  Clock,
  Users,
  Loader2,
  ThumbsUp,
  ImageIcon,
  Award,
  Megaphone,
  Vote,
} from 'lucide-react';
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
import { BadgeCard } from '../badges/badge-card';

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

const STATUS_CONFIG = {
  active: {
    label: 'Accepting Entries',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: Users,
    description: 'Submit your project to enter this challenge!',
  },
  voting: {
    label: 'Voting Open',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: Vote,
    description: 'Vote for your favourite entries below!',
  },
  completed: {
    label: 'Completed',
    color: 'bg-muted text-muted-foreground border-border',
    icon: Trophy,
    description: 'This challenge has ended.',
  },
  draft: {
    label: 'Coming Soon',
    color: 'bg-muted text-muted-foreground border-border',
    icon: Clock,
    description: 'This challenge hasn\'t started yet.',
  },
} as const;

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
  const status = (challenge?.status || 'draft') as keyof typeof STATUS_CONFIG;
  const isActive = status === 'active';
  const canVote = status === 'voting' || status === 'completed';

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!challenge) return <p className="text-muted-foreground">Challenge not found</p>;

  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const StatusIcon = statusInfo.icon;
  const winnerEntry = challenge.expand?.winner;
  const winnerUser = challenge.expand?.['winner.user'] || winnerEntry?.expand?.user;
  const winnerBadge = challenge.expand?.winner_badge;

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

  // Sort entries — winner first if completed
  const sortedEntries = [...entries].sort((a, b) => {
    if (challenge.winner === a.id) return -1;
    if (challenge.winner === b.id) return 1;
    return (b.votes || 0) - (a.votes || 0);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h1 className="text-xl font-bold text-foreground">{challenge.title}</h1>
        </div>
        <p className="mt-2 text-sm text-foreground">{challenge.description}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {entries.length} entries
          </span>
          {challenge.end_date && isActive && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / 86400000))} days left
            </span>
          )}
        </div>
      </div>

      {/* Status banner */}
      <div className={`flex items-center gap-3 rounded-lg border p-3 ${statusInfo.color}`}>
        <StatusIcon className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">{statusInfo.label}</p>
          <p className="text-xs opacity-80">{statusInfo.description}</p>
        </div>
      </div>

      {/* Winner announcement */}
      {status === 'completed' && winnerEntry && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-bold text-amber-400">Winner</h2>
          </div>
          <div className="flex items-center gap-3">
            {winnerUser && (
              <>
                {getAvatarUrl(winnerUser) ? (
                  <img src={getAvatarUrl(winnerUser)!} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted" />
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {winnerEntry.project_title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {getDisplayName(winnerUser)}
                  </p>
                </div>
              </>
            )}
            {winnerBadge && (
              <div className="ml-auto">
                <BadgeCard badge={winnerBadge} earned />
              </div>
            )}
          </div>
          {challenge.announcement && (
            <div className="flex items-start gap-2 mt-2 rounded-lg bg-card/50 p-3">
              <Megaphone className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{challenge.announcement}</p>
            </div>
          )}
        </div>
      )}

      {/* Submit entry */}
      {isActive && !hasSubmitted && (
        <div>
          {!showSubmit ? (
            <button
              onClick={() => setShowSubmit(true)}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary/80"
            >
              Submit Your Entry
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
        <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-400">
          You&apos;ve submitted your entry! Voting will begin once the submission period ends.
        </p>
      )}

      {/* Entries gallery */}
      {sortedEntries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Entries
            {canVote && (
              <span className="ml-2 font-normal text-muted-foreground">
                — tap the <ThumbsUp className="inline h-3 w-3" /> to vote
              </span>
            )}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedEntries.map((entry: RecordModel) => {
              const hasVoted = votedEntries?.has(entry.id);
              const entryUser = entry.expand?.user;
              const avatarUrl = entryUser ? getAvatarUrl(entryUser) : null;
              const isWinner = challenge.winner === entry.id;

              return (
                <div
                  key={entry.id}
                  className={`overflow-hidden rounded-lg border bg-card ${
                    isWinner
                      ? 'border-amber-500/50 ring-1 ring-amber-500/30'
                      : 'border-border'
                  }`}
                >
                  {/* Winner ribbon */}
                  {isWinner && (
                    <div className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1">
                      <Trophy className="h-3 w-3 text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Winner</span>
                    </div>
                  )}

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

                    {/* Vote button overlay */}
                    {canVote && (
                      <button
                        onClick={() => handleVote(entry.id)}
                        disabled={voteEntry.isPending || unvoteEntry.isPending}
                        className={`absolute bottom-2 right-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-lg backdrop-blur-sm transition-all disabled:opacity-50 ${
                          hasVoted
                            ? 'bg-primary text-white scale-105'
                            : 'bg-black/60 text-white hover:bg-primary/80 hover:scale-105'
                        }`}
                      >
                        <ThumbsUp className={`h-3 w-3 ${hasVoted ? 'fill-current' : ''}`} />
                        {entry.votes || 0}
                      </button>
                    )}

                    {/* Vote count for non-voting phases */}
                    {!canVote && (entry.votes || 0) > 0 && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                        <ThumbsUp className="h-3 w-3" />
                        {entry.votes}
                      </div>
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
