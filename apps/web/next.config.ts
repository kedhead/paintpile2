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
};

export default nextConfig;
