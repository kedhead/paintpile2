import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@paintpile/shared', '@paintpile/ui'],
  serverExternalPackages: ['puppeteer-core', 'sharp', 'web-push', 'nodemailer'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8090',
      },
      {
        protocol: 'https',
        hostname: 'thepaintpile.com',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/community', destination: '/feed?tab=gallery', permanent: true },
      { source: '/armies', destination: '/projects?tab=armies', permanent: true },
      { source: '/armies/:armyId', destination: '/projects/armies/:armyId', permanent: true },
      { source: '/analytics', destination: '/dashboard', permanent: true },
      { source: '/activity', destination: '/dashboard?tab=activity', permanent: true },
    ];
  },
};

export default nextConfig;
