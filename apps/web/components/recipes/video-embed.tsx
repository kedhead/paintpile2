'use client';

interface VideoEmbedProps {
  url: string;
}

function parseVideoUrl(url: string): { provider: 'youtube' | 'vimeo'; id: string } | null {
  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  if (ytMatch) return { provider: 'youtube', id: ytMatch[1] };

  // Vimeo: vimeo.com/ID, player.vimeo.com/video/ID
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/
  );
  if (vimeoMatch) return { provider: 'vimeo', id: vimeoMatch[1] };

  return null;
}

export function VideoEmbed({ url }: VideoEmbedProps) {
  const parsed = parseVideoUrl(url);

  if (!parsed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline"
      >
        {url}
      </a>
    );
  }

  const embedUrl =
    parsed.provider === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${parsed.id}`
      : `https://player.vimeo.com/video/${parsed.id}`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        src={embedUrl}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
