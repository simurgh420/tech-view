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
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/files/:path*',
      },
    ];
  },
};

export default nextConfig;
