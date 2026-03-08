'use client';

import { useAuth } from '../../../components/auth-provider';
import { ProfileHeader } from '../../../components/profile/profile-header';
import { ProfilePostGrid } from '../../../components/profile/profile-post-grid';
import { ProfileProjectGrid } from '../../../components/profile/profile-project-grid';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProfileHeader profileUser={user} />
      <h2 className="text-lg font-semibold text-foreground">Projects</h2>
      <ProfileProjectGrid userId={user.id} />
      <h2 className="text-lg font-semibold text-foreground">Posts</h2>
      <ProfilePostGrid userId={user.id} />
    </div>
  );
}
