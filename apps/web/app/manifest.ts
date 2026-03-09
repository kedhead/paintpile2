import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Paintpile',
    short_name: 'Paintpile',
    description: 'Track your miniature painting projects, paints, and recipes',
    start_url: '/feed',
    display: 'standalone',
    background_color: '#0a0e14',
    theme_color: '#151a23',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
