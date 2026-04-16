'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

const PLACEHOLDER = '/images/placeholder.jpg';

/**
 * URL-encodes each path segment (preserving slashes and query string).
 * Fixes "image not loading" issues for filenames that contain spaces or
 * special characters — e.g. `/images/Jivo Logo.png` → `/images/Jivo%20Logo.png`
 */
function encodePath(raw: string): string {
  if (!raw) return PLACEHOLDER;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
    return raw;
  }
  const [pathPart, queryPart] = raw.split('?');
  const encoded = pathPart
    .split('/')
    .map((segment, i) => (i === 0 && segment === '' ? '' : encodeURIComponent(segment)))
    .join('/');
  return queryPart ? `${encoded}?${queryPart}` : encoded;
}

interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  /** Called once after the image has definitively failed to load (after retry). */
  onMissing?: (failedUrl: string) => void;
}

/**
 * Drop-in for next/image with three robustness features:
 *
 *   1. URL-encodes the path so filenames with spaces work in every browser.
 *   2. On load failure: tries ONCE more with a cache-busting query param
 *      (handles transient network blips and stale browser cache after
 *      dev restarts), and only then falls back to the placeholder.
 *   3. Logs a warning in dev and calls `onMissing(url)` so admin pages
 *      can surface a toast / banner.
 *
 * `unoptimized` skips the /_next/image cache layer (the source of most
 * "stale image" issues).
 */
export function SafeImage({ src, alt, onMissing, ...rest }: SafeImageProps) {
  const initial = useMemo(() => encodePath(src), [src]);

  type Phase = 'initial' | 'retry' | 'fallback';
  const [phase, setPhase] = useState<Phase>('initial');
  const [currentSrc, setCurrentSrc] = useState(initial);
  const reportedRef = useRef(false);

  // Reset state when the prop changes (admin uploads a new image)
  useEffect(() => {
    setPhase('initial');
    setCurrentSrc(initial);
    reportedRef.current = false;
  }, [initial]);

  return (
    <Image
      {...rest}
      key={`${initial}-${phase}`} // re-mount on phase change so onError fires again
      src={currentSrc}
      alt={alt}
      unoptimized
      onError={() => {
        if (phase === 'initial') {
          // Transient failure? Try once more with a cache-buster.
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `[SafeImage] First load failed for "${initial}" — retrying with cache-bust…`,
            );
          }
          setPhase('retry');
          setCurrentSrc(`${initial}${initial.includes('?') ? '&' : '?'}_r=${Date.now()}`);
          return;
        }

        if (phase === 'retry') {
          if (!reportedRef.current) {
            reportedRef.current = true;
            if (process.env.NODE_ENV === 'development') {
              console.warn(
                `[SafeImage] Image failed after retry. URL: ${initial} ` +
                  `— falling back to placeholder. Re-upload via /admin to fix.`,
              );
            }
            onMissing?.(initial);
          }
          setPhase('fallback');
          setCurrentSrc(PLACEHOLDER);
          return;
        }
        // Already on fallback — silently ignore further errors.
      }}
    />
  );
}
