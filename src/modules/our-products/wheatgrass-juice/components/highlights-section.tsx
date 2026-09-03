'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { WheatgrassHighlightsContent } from '../types';
import { defaultHighlightsContent } from '../data/defaults';
import { WHEATGRASS_FOREST, WHEATGRASS_CREAM } from '../constants';

interface Props {
  data?: WheatgrassHighlightsContent;
}

/** Heading reveal — rises and settles with a soft ease. */
const textReveal = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Highlight reveal — lifts and scales in, staggered by the parent container. */
const highlightReveal = {
  hidden: { opacity: 0, y: 26, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * Section 5 — "KEY HIGHLIGHTS".
 *
 * An icon row over a full-bleed wheatgrass photo, using grid stacking
 * (responsive.md §6) so the copy stays in normal flow. Mirrors the water
 * page's "A Better Bottle" feature row, with the photo behind it.
 */
export function HighlightsSection({ data }: Props) {
  const { heading, highlights, backgroundImage } = data ?? defaultHighlightsContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;
  const highlightItem = prefersReduced ? reducedMotion : highlightReveal;

  return (
    <section
      aria-labelledby="wheatgrass-highlights-heading"
      className="relative grid min-h-[70dvh] w-full overflow-hidden [grid-template-areas:'stack'] *:[grid-area:stack] lg:min-h-[80dvh]"
      style={{ backgroundColor: WHEATGRASS_FOREST }}
    >
      {/* Background layer — full-bleed wheatgrass photo. A dark scrim keeps the
          white copy legible over the busy foliage (responsive.md §6). */}
      <div className="relative">
        {backgroundImage ? (
          <SafeImage
            src={backgroundImage}
            alt=""
            fill
            quality={95}
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: WHEATGRASS_FOREST }} />
        )}
        <div aria-hidden className="absolute inset-0 bg-black/30" />
      </div>

      {/* Copy layer */}
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 flex w-full flex-col justify-center px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:px-[7%] lg:py-24 2xl:px-[9%] 2xl:py-28"
      >
        <motion.h2
          id="wheatgrass-highlights-heading"
          variants={item}
          className="font-jost-extrabold sm:mb-25 text-balance text-[clamp(1.5rem,1.05rem+2.2vw,3rem)] leading-[1.1] tracking-[0.04em] uppercase drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]"
          style={{ color: WHEATGRASS_CREAM }}
        >
          {heading}
        </motion.h2>

        {/* Highlight row — full-height dividers between columns at lg, as in
            the design. Wraps to 2/3 columns below that. */}
        <div className="mt-12  grid grid-cols-2 items-stretch gap-x-2 gap-y-10 sm:grid-cols-3 sm:gap-x-4 md:mt-16 md:gap-x-6 lg:mt-20 lg:grid-cols-6 lg:gap-x-0 lg:gap-y-0">
          {highlights.map((highlight, i) => (
            <motion.article
              key={`${highlight.label}-${i}`}
              variants={highlightItem}
              className="group h-full min-w-0 px-3 text-center transition-transform duration-500 ease-out hover:-translate-y-1.5 motion-reduce:transform-none sm:px-5 lg:border-l lg:border-white lg:px-6 lg:first:border-l-0"
            >
              {/* SafeImage resolves empty/unknown values to the upload
                  placeholder, so a highlight never renders an empty hole
                  before artwork is set in admin. */}
              <SafeImage
                src={highlight.image}
                alt=""
                width={160}
                height={160}
                quality={85}
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 14vw, 90px"
                className="mx-auto h-[clamp(2.75rem,6vw,4rem)] w-auto object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-out group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
              />
              <h3
                className="mt-4 font-jost-bold-italic text-[clamp(0.8rem,0.72rem+0.3vw,0.95rem)] leading-snug drop-shadow-[0_1px_8px_rgba(0,0,0,0.75)]"
                style={{ color: WHEATGRASS_CREAM }}
              >
                {highlight.label}
              </h3>
              {highlight.description ? (
                <p
                  className="mt-2 text-pretty font-jost-light text-[clamp(0.8rem,0.72rem+0.3vw,0.95rem)] leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.75)]"
                  style={{ color: WHEATGRASS_CREAM }}
                >
                  {highlight.description}
                </p>
              ) : null}
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export function HighlightsSectionSkeleton() {
  return (
    <section
      className="relative flex min-h-[70dvh] animate-pulse flex-col justify-center overflow-hidden px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:min-h-dvh lg:px-[7%] lg:py-24 2xl:px-[9%] 2xl:py-28"
      style={{ backgroundColor: WHEATGRASS_FOREST }}
    >
      <div className="h-9 w-64 rounded-md bg-white/15 sm:h-11 lg:h-14 lg:w-96" />
      <div className="mt-12 grid grid-cols-2 gap-x-2 gap-y-10 sm:grid-cols-3 sm:gap-x-4 md:mt-16 md:gap-x-6 lg:mt-20 lg:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-3 text-center sm:px-5 lg:px-6">
            <div className="mx-auto h-[clamp(2.75rem,6vw,4rem)] w-[clamp(2.75rem,6vw,4rem)] rounded-lg bg-white/10" />
            <div className="mx-auto mt-4 h-3.5 w-24 rounded bg-white/10" />
            <div className="mx-auto mt-2 h-3.5 w-20 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </section>
  );
}
