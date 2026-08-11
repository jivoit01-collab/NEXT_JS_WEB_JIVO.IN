'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  /** Parallax strength in px at full scroll through the hero. */
  strength?: number;
  /** Extra classes for the positioning wrapper. */
  className?: string;
}

/**
 * Gentle scroll parallax + entrance for the hero bottles.
 *
 * Deliberately NOT a Motion `whileInView` variant: the bottles are part of the
 * LCP paint, so they must render at full opacity in the server HTML. This only
 * layers a transform on top after mount — the image itself never waits on JS.
 *
 * Honors prefers-reduced-motion by skipping all movement.
 */
export function HeroBottles({ children, strength = 28, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [offset, setOffset] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (prefersReduced) return;
    // Next frame so the entrance transition has a starting value to animate from.
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [prefersReduced]);

  useEffect(() => {
    if (prefersReduced) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        // -1 → 1 as the element travels through the viewport.
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        setOffset(Math.max(-1, Math.min(1, progress)) * strength);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [prefersReduced, strength]);

  if (prefersReduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      // Transform-only: the bottles are the LCP paint, so they stay fully
      // opaque at all times — only their position/scale eases in.
      style={{
        transform: `translate3d(0, ${offset + (entered ? 0 : 24)}px, 0) scale(${entered ? 1 : 0.985})`,
        transition: entered ? 'transform 1.1s cubic-bezier(0.22,1,0.36,1)' : 'none',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
