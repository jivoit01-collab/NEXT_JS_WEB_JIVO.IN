import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: 'uploadthing.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      'framer-motion',
      'date-fns',
    ],
    // Allow up to ~10MB uploads through Server Actions (default is 1MB)
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },

  async headers() {
    // Base security headers — always on.
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
