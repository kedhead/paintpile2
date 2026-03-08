'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema, type PostInput } from '@paintpile/shared/src/validation/schemas';
import { useAuth } from '../auth-provider';
import { useCreatePost } from '../../hooks/use-posts';
import { ImageUpload } from './image-upload';
import { UserAvatar } from '../social/user-avatar';
import { Loader2, Send } from 'lucide-react';

export function CreatePostForm() {
  const { user } = useAuth();
  const createPost = useCreatePost();
  const [images, setImages] = useState<File[]>([]);
  const [expanded, setExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: '', isPublic: true },
  });

  const onSubmit = async (data: PostInput) => {
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('is_public', String(data.isPublic));
    formData.append('user', user!.id);
    if (data.tags?.length) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    images.forEach((file) => formData.append('images', file));

    await createPost.mutateAsync(formData);
    reset();
    setImages([]);
    setExpanded(false);
  };

  if (!user) return null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="flex gap-3">
        <UserAvatar user={user} size="md" />
        <div className="min-w-0 flex-1">
          <textarea
            {...register('content')}
            placeholder="What are you painting?"
            rows={expanded ? 3 : 1}
            onFocus={() => setExpanded(true)}
            className="w-full resize-none rounded-md border-0 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.content && (
            <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
          )}

          {expanded && (
            <>
              <ImageUpload files={images} onChange={setImages} />
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(false);
                    reset();
                    setImages([]);
                  }}
                  className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPost.isPending}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
                >
                  {createPost.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Post
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
