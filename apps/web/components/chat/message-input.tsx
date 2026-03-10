'use client';

import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Paperclip, Smile, X, Image as ImageIcon, Film } from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜', '🤪', '😎', '🤩', '🥳', '😤', '😭', '😱', '🤔', '🙄', '😴', '🤮', '💀', '👻', '🤡', '😈', '👽'],
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '🤙', '💪', '👊', '✊', '🫡', '🫶', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💯', '🔥', '⭐'],
  },
  {
    name: 'Hobby',
    emojis: ['🎨', '🖌️', '🖍️', '✏️', '🎭', '🏆', '🎯', '🎲', '🧩', '🗡️', '🛡️', '⚔️', '🏰', '🐉', '🧙', '🧝', '🧟', '👹', '🤖', '🦸', '🎪', '🎬', '📸', '🎮'],
  },
];

interface MessageInputProps {
  onSend: (content: string, files?: File[]) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji]);

  const handleSend = () => {
    const trimmed = content.trim();
    if ((!trimmed && files.length === 0) || disabled) return;
    onSend(trimmed, files.length > 0 ? files : undefined);
    setContent('');
    setFiles([]);
    setShowEmoji(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setFiles((prev) => [...prev, ...selected].slice(0, 10));
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const isVideo = (file: File) => file.type.startsWith('video/');

  return (
    <div className="border-t border-border bg-card p-3">
      {/* File previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file, i) => (
            <div key={i} className="relative group">
              {isVideo(file) ? (
                <div className="h-16 w-20 rounded-lg bg-muted flex items-center justify-center border border-border">
                  <Film className="h-6 w-6 text-muted-foreground" />
                  <span className="absolute bottom-0.5 left-0.5 text-[9px] text-muted-foreground truncate max-w-[72px] px-0.5">
                    {file.name}
                  </span>
                </div>
              ) : (
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover border border-border"
                />
              )}
              <button
                onClick={() => removeFile(i)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Attach files"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Emoji button */}
        <div className="relative" ref={emojiRef}>
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
              showEmoji ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Emoji"
          >
            <Smile className="h-4 w-4" />
          </button>

          {showEmoji && (
            <div className="absolute bottom-11 left-0 w-72 rounded-lg border border-border bg-card shadow-xl z-50">
              <div className="p-2 max-h-52 overflow-y-auto">
                {EMOJI_CATEGORIES.map((cat) => (
                  <div key={cat.name} className="mb-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-1">
                      {cat.name}
                    </p>
                    <div className="flex flex-wrap">
                      {cat.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-border px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || (!content.trim() && files.length === 0)}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary/80 disabled:opacity-40"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
