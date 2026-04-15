'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyOnViewProps {
  children: ReactNode;
  /** Pre-mount margin around the viewport. Higher = earlier load. Default: 200px. */
  rootMargin?: string;
  /** Optional placeholder rendered while children are not yet mounted. */
  fallback?: ReactNode;
  /** If true, will keep observing and unmount children if they leave (rare — default off). */
  keepObserving?: boolean;
  /** Min height of the placeholder so layout doesn't jump before mount. */
  minHeight?: number | string;
}

/**
 * Mounts its children only when the wrapper enters the viewport (with a margin).
 *
 * Use ONLY for client-only widgets that don't need SSR (chat widgets, related
 * carousels, comments, etc.). For SEO-relevant content, render normally and
 * rely on `next/dynamic` for JS code splitting — see
 * `src/modules/home/components/home-main.tsx`.
 *
 * Hydration-safe: SSR renders the fallback (matching the first client render),
 * and children mount on the client only after IntersectionObserver fires.
 */
export function LazyOnView({
  children,
  rootMargin = '200px',
  fallback = null,
  keepObserving = false,
  minHeight = 1,
}: LazyOnViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Initial state must match between server and first client render to avoid
  // hydration mismatch — start `false` (fallback) on both.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (very old browsers / certain test envs)
    // → just show children after mount.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (!keepObserving) io.disconnect();
        } else if (keepObserving) {
          setVisible(false);
        }
      },
      { rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [rootMargin, keepObserving]);

  return (
    <div
      ref={ref}
      style={{
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
      }}
    >
      {visible ? children : fallback}
    </div>
  );
}
