'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  /** Parallax strength in px at full scroll through the hero. */
  strength?: number;
  /** Extra classes for the positioning wrapper. */
  className?: string;
  /**
   * Extra inline styles for the positioning wrapper, merged with the parallax
   * transform this component owns. Needed because Tailwind's scanner does not
   * reliably emit arbitrary values written in multi-line template literals.
   */
  style?: React.CSSProperties;
}

/**
 * Gentle scroll parallax for the hero jar group.
 *
 * The throw-in entrance is CSS, applied per-bottle in the hero
 * (`.animate-desi-ghee-bottle-throw`) so the small bottle can land before the
 * large one. This wrapper only layers the scroll offset on top.
 *
 * Honors prefers-reduced-motion by skipping all movement.
 */
export function HeroBottles({ children, strength = 28, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [offset, setOffset] = useState(0);

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
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      // Caller styles first, then the parallax transform — so a caller can set
      // width/height/margins without clobbering the scroll offset.
      //
      // Scroll parallax only. The throw-in entrance lives on each bottle
      // (`.animate-desi-ghee-bottle-throw`) so they can arrive in sequence —
      // moving the group here would drag them in together.
      style={{
        ...style,
        transform: `translate3d(0, ${offset}px, 0)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
