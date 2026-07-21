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

  // After a client-side navigation, force the viewport to the top and KEEP it pinned
  // there while the asynchronously-loaded DB content streams in.
  //
  // Why a fixed-delay reset isn't enough: the navbar/footer live in the persistent
  // (public) layout, so only the main content swaps — and that content arrives from
  // the database hundreds of ms AFTER the route changes. The page is briefly short at
  // navigation time and grows later, so a one-frame reset fires before the real height
  // exists. Instead we re-assert "top" on every height change (ResizeObserver on
  // #smooth-content) for a bounded window after navigation, then disconnect so we
  // never fight the user's own scrolling.
  //
  // Order matters: ScrollTrigger.refresh() runs BEFORE the final scrollTo(0) on every
  // pass, so the last authoritative action is always "go to top" — a refresh can't
  // re-apply a stale non-zero offset afterward. `behavior: 'instant'` forces a jump
  // (the global `scroll-behavior: smooth` would otherwise animate the reset). The
  // window.scrollTo path also covers the reduced-motion / touch case where no
  // ScrollSmoother instance exists.
  useGSAP(
    () => {
      const getSmoother = () => ScrollSmoother.get();

      const jumpToTop = () => {
        getSmoother()?.scrollTo(0, false);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      };
      // refresh FIRST, jump LAST — "top" is always the final, authoritative action.
      const reassertTop = () => {
        ScrollTrigger.refresh();
        jumpToTop();
      };

      // 1. Immediate reset.
      reassertTop();

      // 2. Re-assert as the DB content arrives and the height settles.
      const contentEl = content.current;
      let closed = false;
      let scheduled = false;
      let rafId = 0;
      let stableTimer = 0;
      let hardCapTimer = 0;
      let observer: ResizeObserver | null = null;

      const closeWindow = () => {
        if (closed) return;
        closed = true;
        observer?.disconnect();
        if (rafId) cancelAnimationFrame(rafId);
        window.clearTimeout(stableTimer);
        window.clearTimeout(hardCapTimer);
      };

      // Close once the height has been stable (no resize) for ~300ms.
      const armStableTimer = () => {
        window.clearTimeout(stableTimer);
        stableTimer = window.setTimeout(() => closeWindow(), 300);
      };

      if (contentEl && typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => {
          // Coalesce bursts of resize notifications into one re-assert per frame — a
          // refresh() can itself nudge layout, so this avoids a tight refresh loop.
          if (closed || scheduled) return;
          scheduled = true;
          rafId = requestAnimationFrame(() => {
            scheduled = false;
            if (closed) return;
            reassertTop();
            armStableTimer();
          });
        });
        observer.observe(contentEl);
        armStableTimer(); // close even if no resize ever fires
        // Hard cap: never re-assert for more than ~2s after navigation.
        hardCapTimer = window.setTimeout(() => closeWindow(), 2000);
      }

      // Clean up on unmount / next pathname change.
      return () => closeWindow();
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
