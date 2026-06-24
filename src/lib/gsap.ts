'use client';

/**
 * Central GSAP entry point. Registers every plugin the site uses exactly once,
 * client-side only. Import `{ gsap, ScrollTrigger, ScrollSmoother, SplitText,
 * useGSAP }` from here instead of from 'gsap/*' directly so registration never
 * happens twice and SSR never touches a browser-only plugin.
 *
 * GSAP 3.13+ ships ScrollSmoother / SplitText / ScrollTrigger for free.
 * Use only transform/opacity in animations and always provide a
 * `prefers-reduced-motion` branch via `gsap.matchMedia()` (see responsive.md §11).
 */
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText);
}

export { gsap, useGSAP, ScrollTrigger, ScrollSmoother, SplitText };
