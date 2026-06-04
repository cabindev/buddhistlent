// next.config.ts
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'healthy-sobriety.sdnthailand.com/auth/signin',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'healthy-sobriety.sdnthailand.com/auth/signin',
        port: '',
        pathname: '/img/**',
      },
    ],
  },
};

export default nextConfig;