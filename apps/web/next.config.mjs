import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

/** ESM-safe way to get __dirname */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true, // 🔍 Useful for debugging errors in prod
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
    config.resolve.alias['@'] = resolve(__dirname, '.');
    return config;
  },
};

export default nextConfig;
