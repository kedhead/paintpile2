'use client';

import Image from 'next/image';
import { getAvatarUrl } from '../../lib/pb-helpers';
import type { RecordModel } from 'pocketbase';

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
};

const thumbSizes = {
  sm: '64x64',
  md: '80x80',
  lg: '128x128',
};

interface UserAvatarProps {
  user: RecordModel;
  size?: keyof typeof sizes;
  className?: string;
}

export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const avatarUrl = getAvatarUrl(user, thumbSizes[size]);
  const name = user.name || user.displayName || user.email || '?';
  const initial = name[0]?.toUpperCase() || '?';

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
        height={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 ${className}`}
    >
      {initial}
    </div>
  );
}
