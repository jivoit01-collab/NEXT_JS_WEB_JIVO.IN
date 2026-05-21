import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const MAX_VIDEO_UPLOAD_SIZE_MB = 400;
const MULTIPART_UPLOAD_OVERHEAD_MB = 20;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

  images: {
    qualities: [75, 90, 100],
    remotePatterns: [
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: 'uploadthing.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query', 'framer-motion', 'date-fns'],
    // /api/upload uses multipart/form-data. Next clones request bodies through
    // the proxy layer before route handlers run, and the default cap is 10MB.
    // Keep the route-level video limit at exactly 400MB, but allow 20MB of
    // multipart/header overhead so a valid 400MB video is not truncated before
    // req.formData() can parse it.
    proxyClientMaxBodySize: `${MAX_VIDEO_UPLOAD_SIZE_MB + MULTIPART_UPLOAD_OVERHEAD_MB}mb`,
    // Server Actions are separate from /api/upload; keep them small so accidental
    // action posts do not accept large payloads meant for the upload endpoint.
    serverActions: {
      bodySizeLimit: '12mb',
    },
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
