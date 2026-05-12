import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Paintpile - The Community for Miniature Painters',
  description:
    'The all-in-one app for Warhammer and tabletop miniature painters. Track projects with Kanban, manage 4,700+ paints, get AI critique, share recipes, and connect with a passionate community. Free to start.',
  keywords: [
    'miniature painting',
    'Warhammer 40k',
    'tabletop',
    'paint tracker',
    'Warhammer',
    'mini painting app',
    'painting recipes',
    'paint inventory',
    'AI art critique',
    'miniature hobby',
    'Warhammer community',
  ],
  openGraph: {
    title: 'Paintpile - The Community for Miniature Painters',
    description:
      'Track your Warhammer and tabletop miniature painting projects. 4,700+ paints database, AI-powered critiques, recipes, and a passionate community.',
    siteName: 'Paintpile',
    type: 'website',
    url: 'https://thepaintpile.com',
    images: [
      {
        url: 'https://thepaintpile.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Paintpile - The Community for Miniature Painters',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paintpile - The Community for Miniature Painters',
    description:
      'Track Warhammer & tabletop mini painting projects. AI critique, 4,700+ paints database, recipes, community. Free to start.',
    images: ['https://thepaintpile.com/og-image.png'],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="alternate" type="application/rss+xml" title="Paintpile Feed" href="/feed.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Paintpile',
              url: 'https://thepaintpile.com',
              description:
                'The all-in-one platform for Warhammer and tabletop miniature painters. Track projects, manage paints, get AI critique, and connect with a community.',
              applicationCategory: 'LifestyleApplication',
              operatingSystem: 'Web, iOS, Android',
              offers: [
                { '@type': 'Offer', name: 'Free Plan', price: '0', priceCurrency: 'USD' },
                { '@type': 'Offer', name: 'Pro Plan', price: '5', priceCurrency: 'USD' },
              ],
            }),
          }}
        />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KQQ8WWKRQB"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-KQQ8WWKRQB');`}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
