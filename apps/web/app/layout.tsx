import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Paintpile - The Community for Miniature Painters',
  description: 'Track your miniature painting projects, get AI-powered critiques, manage 4,700+ paints, share recipes, and connect with fellow hobbyists.',
  openGraph: {
    title: 'Paintpile - The Community for Miniature Painters',
    description: 'Track your miniature painting projects, get AI-powered critiques, manage 4,700+ paints, and connect with fellow hobbyists.',
    siteName: 'Paintpile',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Paintpile - The Community for Miniature Painters',
    description: 'Track your miniature painting projects, get AI-powered critiques, and connect with fellow hobbyists.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Paintpile',
  },
  applicationName: 'Paintpile',
};

export const viewport: Viewport = {
  themeColor: '#14111e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="alternate" type="application/rss+xml" title="Paintpile Feed" href="/feed.xml" />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
