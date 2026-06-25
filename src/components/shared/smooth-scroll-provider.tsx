'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap, useGSAP, ScrollSmoother, ScrollTrigger } from '@/lib/gsap';

/**
 * Site-wide GSAP ScrollSmoother. The navbar and any portalled overlays must live
 * OUTSIDE this wrapper (ScrollSmoother transforms #smooth-content, which breaks
 * `position: fixed` descendants).
 *
 * Under `prefers-reduced-motion: reduce` no smoother is created — the browser's
 * native scroll is used instead (responsive.md §10.4). Touch devices also fall
 * back to native scroll (`smoothTouch` defaults to off), avoiding the mobile
 * URL-bar jump.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const wrapper = useRef<HTMLDivElement | null>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const smoother = ScrollSmoother.create({
          wrapper: wrapper.current!,
          content: content.current!,
          smooth: 1.2,
          effects: true, // enables data-speed / data-lag parallax on descendants
        });
        return () => smoother.kill();
      });
      return () => mm.revert();
    },
    { scope: wrapper },
  );

  // After a client-side navigation, jump to top and recalculate every trigger.
  // Runs twice: once immediately, then again on the next frame once the route's
  // late-mounting (dynamic()/LazyOnView) sections have settled the page height, so
  // "top" is computed against the final layout instead of a stale, shorter height.
  // - ScrollSmoother.scrollTo(0, false) resets the desktop smoother (transform-driven).
  // - window.scrollTo(..., 'instant') is the fallback for the reduced-motion / touch
  //   path where no smoother instance exists, and forces a jump (the global
  //   `scroll-behavior: smooth` would otherwise animate the reset into a visible crawl).
  useGSAP(
    () => {
      const jumpToTop = () => {
        ScrollSmoother.get()?.scrollTo(0, false);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      };

      jumpToTop();
      ScrollTrigger.refresh();

      const rafId = requestAnimationFrame(() => {
        jumpToTop();
        ScrollTrigger.refresh();
      });

      // Cancel the pending second pass on unmount / next pathname change.
      return () => cancelAnimationFrame(rafId);
    },
    { dependencies: [pathname] },
  );

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}
