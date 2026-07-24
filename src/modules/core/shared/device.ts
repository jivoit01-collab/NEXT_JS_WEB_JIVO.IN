import type { AnalyticsDeviceType } from '@prisma/client';

/**
 * Lightweight, dependency-free User-Agent parsing.
 *
 * This is intentionally heuristic (no external UA library) — good enough to
 * bucket visitors by browser / OS / device class for analytics. The client may
 * also send authoritative hints (screen size, platform) which take precedence.
 */

export interface ParsedUserAgent {
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  device: string | null;
  deviceType: AnalyticsDeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const EMPTY: ParsedUserAgent = {
  browser: null,
  browserVersion: null,
  os: null,
  device: null,
  deviceType: 'UNKNOWN',
  isMobile: false,
  isTablet: false,
  isDesktop: false,
};

function matchVersion(ua: string, pattern: RegExp): string | null {
  const m = ua.match(pattern);
  return m?.[1] ?? null;
}

export function parseUserAgent(userAgent: string | null | undefined): ParsedUserAgent {
  const ua = userAgent?.trim();
  if (!ua) return { ...EMPTY };

  // ── Browser (order matters: check derivatives before their base engine) ──
  let browser: string | null = null;
  let browserVersion: string | null = null;
  if (/edg\//i.test(ua)) {
    browser = 'Edge';
    browserVersion = matchVersion(ua, /edg\/([\d.]+)/i);
  } else if (/opr\/|opera/i.test(ua)) {
    browser = 'Opera';
    browserVersion = matchVersion(ua, /(?:opr|opera)\/([\d.]+)/i);
  } else if (/chrome\/|crios\//i.test(ua)) {
    browser = 'Chrome';
    browserVersion = matchVersion(ua, /(?:chrome|crios)\/([\d.]+)/i);
  } else if (/firefox\/|fxios\//i.test(ua)) {
    browser = 'Firefox';
    browserVersion = matchVersion(ua, /(?:firefox|fxios)\/([\d.]+)/i);
  } else if (/safari\//i.test(ua)) {
    browser = 'Safari';
    browserVersion = matchVersion(ua, /version\/([\d.]+)/i);
  }

  // ── OS ──
  let os: string | null = null;
  if (/windows nt/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // ── Device class ──
  const isTablet = /ipad/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua));
  const isMobile = !isTablet && /mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua);
  const isDesktop = !isMobile && !isTablet;

  const deviceType: AnalyticsDeviceType = isTablet
    ? 'TABLET'
    : isMobile
      ? 'MOBILE'
      : 'DESKTOP';

  const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  return { browser, browserVersion, os, device, deviceType, isMobile, isTablet, isDesktop };
}

/** Map a client-declared device string to the enum (client hint beats UA sniffing). */
export function normalizeDeviceType(value: string | null | undefined): AnalyticsDeviceType | null {
  switch (value?.toLowerCase()) {
    case 'mobile':
      return 'MOBILE';
    case 'tablet':
      return 'TABLET';
    case 'desktop':
      return 'DESKTOP';
    default:
      return null;
  }
}
