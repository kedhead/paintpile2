'use client';

import Image from 'next/image';
import { getDisplayName } from '@paintpile/shared';
import { getAvatarUrl } from '../../lib/pb-helpers';
import { OnlineIndicator } from './online-indicator';
import type { RecordModel } from 'pocketbase';

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
};

const thumbSizes = {
  xs: '48x48',
  sm: '64x64',
  md: '80x80',
  lg: '128x128',
};

const indicatorSizes: Record<string, 'sm' | 'md' | 'lg'> = {
  xs: 'sm',
  sm: 'sm',
  md: 'sm',
  lg: 'md',
};

interface UserAvatarProps {
  user: RecordModel;
  size?: keyof typeof sizes;
  className?: string;
  showOnline?: boolean;
}

export function UserAvatar({ user, size = 'md', className = '', showOnline = false }: UserAvatarProps) {
  const avatarUrl = getAvatarUrl(user, thumbSizes[size]);
  const name = getDisplayName(user, user.email || '?');
  const initial = (name.startsWith('@') ? name[1] : name[0])?.toUpperCase() || '?';

  const avatar = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt={name}
      width={size === 'lg' ? 64 : size === 'md' ? 40 : size === 'sm' ? 32 : 24}
      height={size === 'lg' ? 64 : size === 'md' ? 40 : size === 'sm' ? 32 : 24}
      className={`${sizes[size]} rounded-full object-cover ${className}`}
    />
  ) : (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-full bg-primary/20 font-bold text-primary ${className}`}
    >
      {initial}
    </div>
  );

  if (!showOnline) return avatar;

  return (
    <div className="relative inline-flex">
      {avatar}
      <span className="absolute -bottom-0.5 -right-0.5">
        <OnlineIndicator lastActiveAt={user.last_active_at} size={indicatorSizes[size]} />
      </span>
    </div>
  );
}
