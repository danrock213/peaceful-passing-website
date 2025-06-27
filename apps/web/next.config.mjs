import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=43200',
          },
        ],
      },
    ];
  },
  webpack(config) {
    config.resolve.alias['@'] = path.resolve('.');
    return config;
  },
};

export default nextConfig;
