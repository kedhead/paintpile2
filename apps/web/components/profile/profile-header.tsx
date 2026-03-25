'use client';

import { useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { getDisplayName } from '@paintpile/shared';
import { UserAvatar } from '../social/user-avatar';
import { FollowButton } from '../social/follow-button';
import { ProfileStats } from './profile-stats';
import { FollowerListModal } from './follower-list-modal';
import { SocialLinksDisplay } from './social-links-display';
import { OnlineIndicator } from '../social/online-indicator';
import { ProfileBadges } from '../badges/profile-badges';
import { ProfileEditForm } from './profile-edit-form';
import { useFollowers, useFollowing } from '../../hooks/use-follows';
import { useUserStats } from '../../hooks/use-user-profile';
import { useAuth } from '../auth-provider';
import { Pencil } from 'lucide-react';

interface ProfileHeaderProps {
  profileUser: RecordModel;
}

export function ProfileHeader({ profileUser }: ProfileHeaderProps) {
  const { user } = useAuth();
  const { data: stats } = useUserStats(profileUser.id);
  const { data: followers = [] } = useFollowers(profileUser.id);
  const { data: following = [] } = useFollowing(profileUser.id);
  const [modal, setModal] = useState<'followers' | 'following' | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  const isOwnProfile = user?.id === profileUser.id;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <UserAvatar user={profileUser} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">
                {getDisplayName(profileUser)}
              </h1>
              <OnlineIndicator lastActiveAt={profileUser.last_active_at} />
            </div>
            {!isOwnProfile && <FollowButton targetUserId={profileUser.id} />}
            {isOwnProfile && (
              <button
                onClick={() => setShowEdit(true)}
                className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1"
              >
                <Pencil className="h-3 w-3" />
                Edit Profile
              </button>
            )}
          </div>
          {profileUser.username && profileUser.name && (
            <p className="text-sm text-muted-foreground">{profileUser.name}</p>
          )}
          {profileUser.bio && (
            <p className="mt-2 text-sm text-foreground">{profileUser.bio}</p>
          )}
          {profileUser.social_links && (
            <div className="mt-2">
              <SocialLinksDisplay links={profileUser.social_links} />
            </div>
          )}
          <div className="mt-4">
            <ProfileStats
              postCount={stats?.postCount || 0}
              followerCount={followers.length}
              followingCount={following.length}
              onFollowersClick={() => setModal('followers')}
              onFollowingClick={() => setModal('following')}
            />
          </div>
        </div>
      </div>

      <ProfileBadges userId={profileUser.id} />

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
      {showEdit && <ProfileEditForm onClose={() => setShowEdit(false)} />}
    </div>
  );
}
