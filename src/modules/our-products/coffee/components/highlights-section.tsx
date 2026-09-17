'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage, isPlaceholderValue } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { CoffeeKeyHighlightsContent } from '../types';
import { defaultKeyHighlightsContent } from '../data/defaults';
import { COFFEE_CARAMEL, COFFEE_CREAM } from '../constants';

interface Props {
  data?: CoffeeKeyHighlightsContent;
}

/** Heading/paragraph reveal — rises and settles with a soft ease. */
const textReveal = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * Section box — shared by the section and its skeleton.
 * Full screen from md up; 60% of the viewport on phones (grows with content).
 * Grid stacking (responsive.md §6): background and copy share one cell, so
 * the copy stays in normal flow and sets the height when it needs more room.
 */
const SECTION_CLASS =
  "relative isolate grid min-h-[60svh] w-full overflow-hidden [grid-template-areas:'stack'] *:[grid-area:stack] md:min-h-dvh";

/**
 * Copy layer — top-left, ~12% down like the design. The top padding never
 * drops below the fixed navbar's height, so the heading is never hidden
 * under it when the section is scrolled to the top.
 */
const COPY_LAYER_CLASS =
  'relative z-10 flex w-full flex-col justify-start px-4 pt-24 pb-12 sm:px-6 sm:pb-14 md:px-[6%] md:pt-[max(7rem,12dvh)] md:pb-[9dvh]';

/** Copy column — clears the beans, which sit on the right of the photo. */
const COPY_COLUMN_CLASS = 'w-full min-w-0 max-w-[36rem] md:max-w-[52%] lg:max-w-[46%]';

/**
 * Section 3 — "KEY HIGHLIGHTS".
 *
 * The uploaded image is a full-bleed background (the roasted-bean photo); the
 * heading and bullet list sit over it, top-left. Without an image the flat
 * caramel field shows.
 */
export function KeyHighlightsSection({ data }: Props) {
  const { heading, paragraph, highlightsHeading, highlights, image } =
    data ?? defaultKeyHighlightsContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;
  const hasImage = !isPlaceholderValue(image);

  return (
    <section
      aria-labelledby="coffee-highlights-heading"
      className={SECTION_CLASS}
      style={{
        backgroundColor: COFFEE_CARAMEL,
        ['--coffee-cream' as string]: COFFEE_CREAM,
      }}
    >
      {/* ── Background layer — full-bleed photo. Anchored right so the beans
          (right side of the photo) stay in frame when narrow screens crop it. ── */}
      <div aria-hidden className="relative">
        {hasImage ? (
          <>
            <SafeImage
              src={image}
              alt=""
              fill
              quality={85}
              sizes="100vw"
              className="object-cover object-right"
            />
            {/* Phones/tablets only: the crop pushes beans behind the copy, so a
                soft left-to-right scrim keeps the text readable. The desktop
                frame has clear space on the left and needs none. */}
            <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/25 to-transparent md:hidden" />
          </>
        ) : null}
      </div>

      {/* ── Copy layer — top-left ── */}
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className={COPY_LAYER_CLASS}
      >
        <div className={COPY_COLUMN_CLASS}>
          <motion.h2
            id="coffee-highlights-heading"
            variants={item}
            className="font-jost-extrabold text-balance text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)] leading-[1.08] tracking-[0.06em] text-(--coffee-cream) uppercase drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]"
          >
            {heading}
          </motion.h2>

          {/* Optional on this page — the design goes straight from the
              heading to the bullet list, so an empty value renders nothing
              rather than a blank line of vertical space. */}
          {paragraph ? (
            <motion.p
              variants={item}
              className="mt-7 w-full font-jost-light text-pretty text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.75] text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)] lg:mt-9"
            >
              {paragraph}
            </motion.p>
          ) : null}

          {highlightsHeading ? (
            <motion.h3
              variants={item}
              className="mt-12 font-jost-extrabold text-[clamp(1.35rem,1rem+1.6vw,2.5rem)] leading-[1.1] tracking-[0.06em] text-(--coffee-cream) uppercase lg:mt-16"
            >
              {highlightsHeading}
            </motion.h3>
          ) : null}

          {/* Lines wrap (no `nowrap`) — the Koffie bullets are long enough
              that pinning them to one line overflows (responsive.md §5 / §7). */}
          <motion.ul
            variants={item}
            className={`space-y-3.5 ${paragraph || highlightsHeading ? 'mt-6' : 'mt-6 lg:mt-8'}`}
          >
            {highlights.map((highlight, i) => (
              <li
                key={i}
                className="flex min-w-0 items-start gap-2.5 font-jost-light text-[clamp(0.95rem,0.82rem+0.45vw,1.3rem)] leading-[1.6] text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)]"
              >
                <span aria-hidden className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-white/80" />
                <span className="min-w-0">{highlight}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </section>
  );
}

export function KeyHighlightsSectionSkeleton() {
  return (
    <section className={`animate-pulse ${SECTION_CLASS}`} style={{ backgroundColor: COFFEE_CARAMEL }}>
      <div className={COPY_LAYER_CLASS}>
        <div className={COPY_COLUMN_CLASS}>
          <div className="h-9 w-3/4 rounded-md bg-white/15 sm:h-11 lg:h-14" />
          {/* Six bullet rows straight after the heading — the shape the page
              actually ships with (prompt1 §44.5). */}
          <div className="mt-6 space-y-3.5 lg:mt-8">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-full rounded bg-white/10 sm:h-5" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
