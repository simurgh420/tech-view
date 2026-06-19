import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@node-rs/argon2'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.brandfetch.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
