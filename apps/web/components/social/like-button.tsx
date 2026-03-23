'use client';

import { Heart } from 'lucide-react';
import { useHasLiked, useToggleLike } from '../../hooks/use-likes';
import { useAuth } from '../auth-provider';
import { LoginPrompt } from '../auth/login-prompt';

interface LikeButtonProps {
  targetId: string;
  targetType: string;
  initialCount: number;
}

export function LikeButton({ targetId, targetType, initialCount }: LikeButtonProps) {
  const { user } = useAuth();
  const { data: liked = false } = useHasLiked(targetId);
  const toggleLike = useToggleLike();

  const handleClick = () => {
    toggleLike.mutate({ targetId, targetType, liked });
  };

  if (!user) {
    return (
      <LoginPrompt action="like this">
        {(open) => (
          <button
            onClick={open}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-red-400"
          >
            <Heart className="h-4 w-4" />
            <span>{initialCount}</span>
          </button>
        )}
      </LoginPrompt>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-red-400"
    >
      <Heart
        className={`h-4 w-4 transition-transform active:scale-125 ${
          liked ? 'fill-red-500 text-red-400' : ''
        }`}
      />
      <span className={liked ? 'text-red-400' : ''}>{initialCount}</span>
    </button>
  );
}
