import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Paintpile',
  description: 'The community for miniature painters',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Paintpile',
  },
  applicationName: 'Paintpile',
};

export const viewport: Viewport = {
  themeColor: '#151a23',
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
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
