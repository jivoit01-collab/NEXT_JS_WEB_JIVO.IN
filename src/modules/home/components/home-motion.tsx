'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { SafeImage } from '@/components/shared/public';
import { cn } from '@/lib/utils';
import { gsap, useGSAP, SplitText } from '@/lib/gsap';

/**
 * Shared GSAP motion primitives for the home page. Every primitive:
 *  - animates only transform/opacity,
 *  - reveals once on scroll-in (integrates with ScrollSmoother automatically),
 *  - has a `prefers-reduced-motion: reduce` branch that shows the final state.
 */

interface GsapRevealProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Per-child stagger (seconds). */
  stagger?: number;
  /** Initial Y offset (px). */
  y?: number;
  /** ScrollTrigger start. */
  start?: string;
}

/**
 * Fade + rise the DIRECT children of this element, staggered, on scroll-in.
 * Use it as the grid/list/stack wrapper so its children are the animated items.
 */
export function GsapReveal({
  children,
  className,
  as: Tag = 'div',
  stagger = 0.12,
  y = 40,
  start = 'top 82%',
}: GsapRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = el.children.length ? gsap.utils.toArray<HTMLElement>(el.children) : [el];

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(targets, { opacity: 0, y });
        const tween = gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger,
          // Drop the inline transform once revealed so CSS :hover transforms
          // (card/pillar lifts) aren't blocked by a leftover inline style.
          clearProps: 'transform',
          scrollTrigger: { trigger: el, start, once: true },
        });
        return () => tween.scrollTrigger?.kill();
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(targets, { opacity: 1, y: 0 });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

interface SplitRevealProps {
  text: string;
  className?: string;
  as?: ElementType;
  type?: 'chars' | 'words';
  stagger?: number;
  start?: string;
}

/**
 * GSAP SplitText reveal — words (default) or chars rise + fade on scroll-in.
 * SSR-safe: renders plain text on the server; splitting happens after mount.
 * Under reduced motion the text simply renders (no split, no animation).
 */
export function SplitReveal({
  text,
  className,
  as: Tag = 'span',
  type = 'words',
  stagger = 0.04,
  start = 'top 85%',
}: SplitRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const split = new SplitText(el, { type });
        const units = type === 'chars' ? split.chars : split.words;
        gsap.set(units, { opacity: 0, yPercent: 100 });
        const tween = gsap.to(units, {
          opacity: 1,
          yPercent: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger,
          scrollTrigger: { trigger: el, start, once: true },
        });
        return () => {
          tween.scrollTrigger?.kill();
          split.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}

interface ParallaxBgProps {
  src: string;
  alt?: string;
  sizes?: string;
  /** Extra classes on the SafeImage (e.g. object-position). */
  objectClass?: string;
  priority?: boolean;
  quality?: number;
}

/**
 * Full-bleed background image with a subtle vertical parallax, gated to lg+ and
 * reduced-motion-safe. The wrapper is over-scaled so the parallax shift never
 * exposes an edge gap. Put it as the first child of a `relative overflow-hidden`
 * section.
 */
export function ParallaxBg({
  src,
  alt = '',
  sizes = '100vw',
  objectClass,
  priority = false,
  quality = 85,
}: ParallaxBgProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el?.parentElement) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const tween = gsap.fromTo(
          el,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: el.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
        return () => tween.scrollTrigger?.kill();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="absolute inset-0 scale-[1.18] will-change-transform">
      <SafeImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        quality={quality}
        sizes={sizes}
        className={cn('object-cover', objectClass)}
      />
    </div>
  );
}
