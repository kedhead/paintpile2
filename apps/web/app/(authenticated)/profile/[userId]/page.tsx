'use client';

import { use } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';
import { useUserProfile } from '../../../../hooks/use-user-profile';
import { ProfileHeader } from '../../../../components/profile/profile-header';
import { ProfilePostGrid } from '../../../../components/profile/profile-post-grid';
import { redirect } from 'next/navigation';

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { user: currentUser } = useAuth();
  const { data: profileUser, isLoading } = useUserProfile(userId);

  // Redirect to own profile page
  if (currentUser?.id === userId) {
    redirect('/profile');
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProfileHeader profileUser={profileUser} />
      <h2 className="text-lg font-semibold text-foreground">Posts</h2>
      <ProfilePostGrid userId={userId} />
    </div>
  );
}
