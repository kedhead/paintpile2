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
  // viewport-fit=cover ensures content extends into iPhone notch/Dynamic Island areas
  // (safe-area-inset-* CSS env vars then let us add padding where needed)
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        {/* Apple home screen icons — 180px is the correct size for modern iPhones */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-192.png" />
        {/* Next.js manifest.ts takes precedence; keep for older browsers */}
        <link rel="manifest" href="/manifest.json" />
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
