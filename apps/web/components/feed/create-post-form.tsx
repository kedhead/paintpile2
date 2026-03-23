'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema, type PostInput } from '@paintpile/shared/src/validation/schemas';
import type { TextOverlay } from '@paintpile/shared/src/types/post';
import { useAuth } from '../auth-provider';
import { useCreatePost } from '../../hooks/use-posts';
import { MediaUpload, type MediaFile } from './media-upload';
import { TextOverlayEditor } from './text-overlay-editor';
import { UserAvatar } from '../social/user-avatar';
import { LoginPrompt } from '../auth/login-prompt';
import { Loader2, Send, PenSquare } from 'lucide-react';

export function CreatePostForm() {
  const { user } = useAuth();
  const createPost = useCreatePost();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [overlayEditorIndex, setOverlayEditorIndex] = useState<number | null>(null);
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

    // Add images
    mediaFiles
      .filter((f) => f.type === 'image')
      .forEach((f) => formData.append('images', f.file));

    // Add videos
    mediaFiles
      .filter((f) => f.type === 'video')
      .forEach((f) => formData.append('videos', f.file));

    // Add text overlays
    if (textOverlays.length > 0) {
      formData.append('text_overlays', JSON.stringify(textOverlays));
    }

    await createPost.mutateAsync(formData);
    reset();
    setMediaFiles([]);
    setTextOverlays([]);
    setExpanded(false);
  };

  const handleOverlaySave = useCallback(
    (newOverlays: TextOverlay[]) => {
      if (overlayEditorIndex === null) return;
      // Replace overlays for this image index, keep others
      setTextOverlays((prev) => [
        ...prev.filter((o) => o.imageIndex !== overlayEditorIndex),
        ...newOverlays,
      ]);
    },
    [overlayEditorIndex]
  );

  if (!user) {
    return (
      <LoginPrompt action="share your work">
        {(open) => (
          <button
            onClick={open}
            className="w-full rounded-lg border border-border bg-card p-4 text-left text-sm text-muted-foreground hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <PenSquare className="h-5 w-5" />
              <span>Sign in to share what you&apos;re painting...</span>
            </div>
          </button>
        )}
      </LoginPrompt>
    );
  }

  // Find the image file for the overlay editor
  const imageFiles = mediaFiles.filter((f) => f.type === 'image');
  const overlayEditorImage =
    overlayEditorIndex !== null ? imageFiles[overlayEditorIndex] : null;

  return (
    <>
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
              <p className="mt-1 text-xs text-red-400">{errors.content.message}</p>
            )}

            {expanded && (
              <>
                <MediaUpload
                  files={mediaFiles}
                  onChange={setMediaFiles}
                  onOverlayClick={(idx) => setOverlayEditorIndex(idx)}
                />

                {/* Overlay indicator */}
                {textOverlays.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                    <span className="font-medium">✏️ {textOverlays.length} text overlay{textOverlays.length !== 1 ? 's' : ''}</span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExpanded(false);
                      reset();
                      setMediaFiles([]);
                      setTextOverlays([]);
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

      {/* Text Overlay Editor Modal */}
      {overlayEditorImage && overlayEditorIndex !== null && (
        <TextOverlayEditor
          imageUrl={overlayEditorImage.previewUrl}
          imageIndex={overlayEditorIndex}
          overlays={textOverlays}
          onSave={handleOverlaySave}
          onClose={() => setOverlayEditorIndex(null)}
        />
      )}
    </>
  );
}
