'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { UserAvatar } from '../social/user-avatar';
import { FollowButton } from '../social/follow-button';
import { ProfileStats } from './profile-stats';
import { FollowerListModal } from './follower-list-modal';
import { useFollowers, useFollowing } from '../../hooks/use-follows';
import { useUserStats } from '../../hooks/use-user-profile';
import { useAuth } from '../auth-provider';

interface ProfileHeaderProps {
  profileUser: RecordModel;
}

export function ProfileHeader({ profileUser }: ProfileHeaderProps) {
  const { user } = useAuth();
  const { data: stats } = useUserStats(profileUser.id);
  const { data: followers = [] } = useFollowers(profileUser.id);
  const { data: following = [] } = useFollowing(profileUser.id);
  const [modal, setModal] = useState<'followers' | 'following' | null>(null);

  const isOwnProfile = user?.id === profileUser.id;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <UserAvatar user={profileUser} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">
              {profileUser.name || profileUser.displayName || 'Painter'}
            </h1>
            {!isOwnProfile && <FollowButton targetUserId={profileUser.id} />}
          </div>
          {profileUser.username && (
            <p className="text-sm text-gray-500">@{profileUser.username}</p>
          )}
          {profileUser.bio && (
            <p className="mt-2 text-sm text-gray-700">{profileUser.bio}</p>
          )}
          <div className="mt-4">
            <ProfileStats
              postCount={stats?.postCount || 0}
              followerCount={stats?.followerCount || 0}
              followingCount={stats?.followingCount || 0}
              onFollowersClick={() => setModal('followers')}
              onFollowingClick={() => setModal('following')}
            />
          </div>
        </div>
      </div>

      {modal === 'followers' && (
        <FollowerListModal
          title="Followers"
          records={followers}
          expandKey="follower"
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'following' && (
        <FollowerListModal
          title="Following"
          records={following}
          expandKey="following"
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
