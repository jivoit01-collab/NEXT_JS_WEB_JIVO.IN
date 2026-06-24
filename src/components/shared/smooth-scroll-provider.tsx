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
  useGSAP(
    () => {
      ScrollSmoother.get()?.scrollTo(0, false);
      ScrollTrigger.refresh();
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
