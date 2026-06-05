'use client';

import { useState, useEffect } from 'react';

export function useScroll(threshold = 50): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    let last = scrolled;

    const update = () => {
      ticking = false;
      const next = window.scrollY > threshold;
      if (next === last) return;
      last = next;
      setScrolled(next);
    };

    const handler = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold, scrolled]);

  return scrolled;
}
