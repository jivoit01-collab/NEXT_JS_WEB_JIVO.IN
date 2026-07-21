import { SITE_URL } from '@/lib/constants';

const ADMIN_PREFIX = '/jivo-dev';

const ADMIN_TO_PUBLIC_ROUTE: Record<string, string> = {
  '': '/',
  '/': '/',
  '/dashboard': '/',
  '/home': '/',
  '/login': '/',
  '/navbar': '/',
  '/footer': '/',
  '/seo': '/',
  '/our-products': '/our-products',
  '/media': '/media',
  '/community': '/community',
  '/our-essence': '/our-essence',
  '/our-essence-the-story': '/our-essence/the-story',
  '/our-essence-core-values': '/our-essence/core-values',
  '/our-essence-baru-sahib-association': '/our-essence/baru-sahib-association',
  '/our-essence-milestones-timeline': '/our-essence/milestones-timeline',
  '/our-essence-social-initiatives': '/our-essence/social-initiatives',
  '/our-essence-our-fair-share': '/our-essence/our-fair-share',
  '/our-essence-for-mother-earth': '/our-essence/for-mother-earth',
  '/our-essence-the-jivo-capital': '/our-essence/the-jivo-capital',
  '/our-essence-certifications-quality-standards':
    '/our-essence/certifications-quality-standards',
};

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/)[0] ?? '';
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  const withoutAdminPrefix = withLeadingSlash.startsWith(ADMIN_PREFIX)
    ? withLeadingSlash.slice(ADMIN_PREFIX.length)
    : withLeadingSlash;

  if (!withoutAdminPrefix || withoutAdminPrefix === '/') return '/';
  return withoutAdminPrefix.replace(/\/+$/, '');
}

function toAbsolutePublicUrl(publicPath: string): string {
  const base = SITE_URL.replace(/\/+$/, '');
  return publicPath === '/' ? `${base}/` : `${base}${publicPath}`;
}

/**
 * Map an analytics dashboard path to the PUBLIC page it reports on.
 * `rest` is the path after `/analytics` (e.g. '', '/our-essence/the-story',
 * '/site/home'). Non-content analytics (auth/visitors/traffic/reports) and the
 * overview point at the homepage.
 */
function analyticsToPublicPath(rest: string): string {
  const segs = rest.split('/').filter(Boolean);
  if (segs.length === 0) return '/'; // overview → home
  const [moduleId, ...pageSegs] = segs;
  const pageId = pageSegs.join('/');
  switch (moduleId) {
    case 'site':
      return '/'; // home / navbar / footer live on the homepage
    case 'our-essence':
      return pageId ? `/our-essence/${pageId}` : '/our-essence';
    case 'products':
      return '/our-products';
    case 'media':
      return '/media';
    case 'community':
      return '/community';
    default:
      return '/'; // authentication / visitors / traffic / reports → home
  }
}

export function getPublicPreviewUrl(adminPathname: string): string {
  const adminPath = normalizePathname(adminPathname);

  // Analytics dashboard → the public page it reports on (never the /analytics URL).
  if (adminPath === '/analytics' || adminPath.startsWith('/analytics/')) {
    return toAbsolutePublicUrl(analyticsToPublicPath(adminPath.slice('/analytics'.length)));
  }

  const mappedPath = ADMIN_TO_PUBLIC_ROUTE[adminPath];
  if (mappedPath) {
    return toAbsolutePublicUrl(mappedPath);
  }

  const ourEssenceMatch = adminPath.match(/^\/our-essence-(.+)$/);
  if (ourEssenceMatch?.[1]) {
    return toAbsolutePublicUrl(`/our-essence/${ourEssenceMatch[1]}`);
  }

  return toAbsolutePublicUrl(adminPath);
}
