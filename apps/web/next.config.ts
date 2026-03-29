import type { NextConfig } from 'next';

const securityHeaders = [
  // Prevent browsers from MIME-sniffing away from the declared content type
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Only allow embedding in same origin (prevents clickjacking)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Strict referrer so third parties don't see full URLs
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Force HTTPS for 1 year on production
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Disable access to sensitive browser features we don't use
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
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
