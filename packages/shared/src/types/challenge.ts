export type ChallengeStatus = 'draft' | 'active' | 'voting' | 'completed';
export type ChallengeType = 'painting' | 'kitbash' | 'community';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
  startDate: string;
  endDate: string;
  rewardBadgeId?: string;
  coverImageUrl?: string;
  participantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeEntry {
  entryId: string;
  challengeId: string;
  userId: string;
  projectId: string;
  photoUrl: string;
  projectTitle: string;
  submittedAt: string;
  votes?: number;
  userDisplayName?: string;
  userPhotoUrl?: string;
}

export type CreateChallengeData = Omit<Challenge, 'id' | 'createdAt' | 'updatedAt' | 'participantCount'>;
