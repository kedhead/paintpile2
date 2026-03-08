'use client';

interface ProfileStatsProps {
  postCount: number;
  followerCount: number;
  followingCount: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export function ProfileStats({
  postCount,
  followerCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
}: ProfileStatsProps) {
  return (
    <div className="flex gap-6">
      <div className="text-center">
        <div className="text-lg font-bold text-foreground">{postCount}</div>
        <div className="text-xs text-muted-foreground">Posts</div>
      </div>
      <button onClick={onFollowersClick} className="text-center hover:opacity-75">
        <div className="text-lg font-bold text-foreground">{followerCount}</div>
        <div className="text-xs text-muted-foreground">Followers</div>
      </button>
      <button onClick={onFollowingClick} className="text-center hover:opacity-75">
        <div className="text-lg font-bold text-foreground">{followingCount}</div>
        <div className="text-xs text-muted-foreground">Following</div>
      </button>
    </div>
  );
}
