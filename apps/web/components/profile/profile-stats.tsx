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
        <div className="text-lg font-bold text-gray-900">{postCount}</div>
        <div className="text-xs text-gray-500">Posts</div>
      </div>
      <button onClick={onFollowersClick} className="text-center hover:opacity-75">
        <div className="text-lg font-bold text-gray-900">{followerCount}</div>
        <div className="text-xs text-gray-500">Followers</div>
      </button>
      <button onClick={onFollowingClick} className="text-center hover:opacity-75">
        <div className="text-lg font-bold text-gray-900">{followingCount}</div>
        <div className="text-xs text-gray-500">Following</div>
      </button>
    </div>
  );
}
