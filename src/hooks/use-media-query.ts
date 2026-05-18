'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const initialTimer = window.setTimeout(() => setMatches(media.matches), 0);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener('change', listener);
    return () => {
      window.clearTimeout(initialTimer);
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}
