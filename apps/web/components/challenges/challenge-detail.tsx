'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { Trophy, Clock, Users, Loader2, ThumbsUp } from 'lucide-react';
import { useChallenge, useChallengeEntries, useSubmitEntry, useVoteEntry } from '../../hooks/use-challenges';
import { useMyProjects } from '../../hooks/use-projects';
import { useAuth } from '../auth-provider';
import { relativeTime } from '../../lib/pb-helpers';

interface ChallengeDetailProps {
  challengeId: string;
}

export function ChallengeDetail({ challengeId }: ChallengeDetailProps) {
  const { user } = useAuth();
  const { data: challenge, isLoading } = useChallenge(challengeId);
  const { data: entries = [] } = useChallengeEntries(challengeId);
  const submitEntry = useSubmitEntry();
  const voteEntry = useVoteEntry();
  const { data: projectsData } = useMyProjects();
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');

  const myProjects = projectsData?.pages.flatMap((p) => p.items) || [];
  const hasSubmitted = entries.some((e: RecordModel) => e.user === user?.id);
  const isActive = challenge?.status === 'active';
  const isVoting = challenge?.status === 'voting';

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
    });
    setShowSubmit(false);
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
          <span className={`rounded-full px-2 py-0.5 font-semibold ${
            isActive ? 'bg-green-500/20 text-green-400' :
            isVoting ? 'bg-amber-500/20 text-amber-400' :
            'bg-muted text-muted-foreground'
          }`}>
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
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a project...</option>
                {myProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowSubmit(false)} className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
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

      {/* Entries gallery */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Entries</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {entries.map((entry: RecordModel) => (
              <div key={entry.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">{entry.project_title}</h4>
                  {(isVoting || challenge.status === 'completed') && (
                    <button
                      onClick={() => voteEntry.mutate({ entryId: entry.id, challengeId })}
                      disabled={voteEntry.isPending}
                      className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      {entry.votes || 0}
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{relativeTime(entry.created)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
