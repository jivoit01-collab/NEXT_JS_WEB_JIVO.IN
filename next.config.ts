import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const MAX_VIDEO_UPLOAD_MB = 400;
const MULTIPART_OVERHEAD_MB = 20;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: 'uploadthing.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    // Keep CMS imagery crisp without allowing accidental quality=100 transfer bloat.
    qualities: [70, 75, 80, 90, 100],
    // Large full-screen sections need high-resolution candidates on lg/2xl displays.
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2048, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query', 'framer-motion', 'date-fns'],
    // Keep the route-level video limit exactly 400MB, while allowing multipart overhead
    // so the request body is not truncated before /api/upload receives the file.
    proxyClientMaxBodySize: `${MAX_VIDEO_UPLOAD_MB + MULTIPART_OVERHEAD_MB}mb`,
    // Allow up to ~10MB uploads through Server Actions (default is 1MB)
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },

  async redirects() {
    return [
      {
        source: '/barusahib-association',
        destination: '/our-essence/baru-sahib-association',
        permanent: true,
      },
    ];
  },

  async headers() {
    // Base security headers - always on.
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];

    if (isProd) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      });
    }

    const routes = [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];

    // Only apply long-lived cache headers in production.
    // In dev, Turbopack rebuilds chunks frequently and immutable
    // caching breaks hot module replacement.
    if (isProd) {
      routes.push(
        {
          source: '/_next/static/(.*)',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
        },
        {
          source: '/api/uploads/(.*)',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800' }],
        },
      );
    }

    return routes;
  },
};

export default nextConfig;
