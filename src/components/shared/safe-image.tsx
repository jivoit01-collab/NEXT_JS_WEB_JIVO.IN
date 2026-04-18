'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Variants } from "framer-motion";

const PLACEHOLDER = '/api/uploads/placeholder.png';
const variants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
/**
 * Resolves a stored image value to a serveable URL:
 *   - Empty/falsy/placeholder → placeholder
 *   - External (http/data)    → pass through
 *   - Absolute path (/…)      → URL-encode segments
 *   - Bare filename           → /api/uploads/<filename>
 */
function resolveSrc(raw: string): string {
  if (!raw || raw === 'placeholder.png') return PLACEHOLDER;
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
    return raw;
  }
  // Bare filename (no leading slash) → serve through uploads API
  if (!raw.startsWith('/')) {
    return `/api/uploads/${encodeURIComponent(raw)}`;
  }
  // Absolute path — URL-encode each segment
  const [pathPart, queryPart] = raw.split('?');
  const encoded = pathPart
    .split('/')
    .map((segment, i) => (i === 0 && segment === '' ? '' : encodeURIComponent(segment)))
    .join('/');
  return queryPart ? `${encoded}?${queryPart}` : encoded;
}

/** Returns true if the value is empty or the seed placeholder — no real image uploaded. */
export function isPlaceholderValue(raw: string | undefined | null): boolean {
  return !raw || raw === 'placeholder.png';
}

interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  /** Called once after the image has definitively failed to load (after retry). */
  onMissing?: (failedUrl: string) => void;
}

/**
 * Drop-in for next/image with robustness features:
 *
 *   1. URL-encodes the path so filenames with spaces work in every browser.
 *   2. On load failure: tries ONCE more with a cache-busting query param
 *      (handles transient network blips and stale browser cache), then
 *      falls back to the placeholder.
 *   3. Logs a clear warning so missing images are easy to diagnose.
 *   4. In dev mode: shows a visible red "MISSING" badge so broken images
 *      are impossible to miss during development.
 */
export function SafeImage({ src, alt, onMissing, sizes, ...rest }: SafeImageProps) {
  const initial = useMemo(() => resolveSrc(src), [src]);
  const isRealImage = !isPlaceholderValue(src);

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

  const isFallback = phase === 'fallback';

  return (
    <span className="relative inline-block" style={{ display: 'contents' }}>
      <Image
        {...rest}
        key={`${initial}-${phase}`}
        src={currentSrc}
        alt={alt}
        sizes={sizes ?? '(max-width: 768px) 100vw, 50vw'}
        onError={() => {
          if (phase === 'initial') {
            // Transient failure? Try once more with a cache-buster.
            console.warn(
              `[SafeImage] Load failed for "${src}" (resolved: ${initial}) — retrying…`,
            );
            setPhase('retry');
            setCurrentSrc(`${initial}${initial.includes('?') ? '&' : '?'}_r=${Date.now()}`);
            return;
          }

          if (phase === 'retry') {
            if (!reportedRef.current) {
              reportedRef.current = true;
              console.warn(
                `[SafeImage] IMAGE MISSING: "${src}" — the file does not exist on disk ` +
                  `or the API cannot serve it. The DB still references this filename. ` +
                  `Re-upload via the admin dashboard to fix. Falling back to placeholder.`,
              );
              onMissing?.(initial);
            }
            setPhase('fallback');
            setCurrentSrc(PLACEHOLDER);
            return;
          }
          // Already on fallback — silently ignore further errors.
        }}
      />
      {/* Dev-only: visible indicator when an image that SHOULD exist is missing */}
      {process.env.NODE_ENV !== 'production' && isRealImage && isFallback && (
        <span
          className="absolute left-1 top-1 z-50 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-tight text-white shadow"
          title={`Missing: ${src}`}
        >
          MISSING
        </span>
      )}
    </span>
  );
}
