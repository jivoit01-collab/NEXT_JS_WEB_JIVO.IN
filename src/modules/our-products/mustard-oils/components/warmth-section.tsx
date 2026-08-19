'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { MustardOilsWarmthContent } from '../types';
import { defaultWarmthContent } from '../data/defaults';
import { MUSTARD_WINE, MUSTARD_FIELD_HEADING } from '../constants';

interface Props {
  data?: MustardOilsWarmthContent;
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
 * Section 4 — "A LITTLE WARMTH, EVERY DAY."
 *
 * Copy sits over a full-bleed sunset mustard-field photo using grid stacking
 * (responsive.md §6), so the text stays in normal flow and reflows cleanly.
 * The copy is centred and anchored near the top of the frame, per the design.
 */
export function WarmthSection({ data }: Props) {
  const { heading, paragraph, backgroundImage } = data ?? defaultWarmthContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;

  return (
    <section
      aria-labelledby="mustard-warmth-heading"
      // 60% of the viewport on small screens so the field photo does not eat a
      // whole phone screen; full height from lg up, as in the design.
      className="relative grid min-h-[60dvh] w-full overflow-hidden [grid-template-areas:'stack'] *:[grid-area:stack] lg:min-h-dvh"
    >
      {/* Background layer — full-bleed. The heading/paragraph carry their own
          drop-shadows for legibility rather than a scrim, so the sunset photo
          reads at full contrast. */}
      <div className="relative">
        {backgroundImage ? (
          <SafeImage
            src={backgroundImage}
            alt=""
            fill
            quality={85}
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: MUSTARD_WINE }} />
        )}
      </div>

      {/* Copy layer — centred, anchored toward the top of the frame. */}
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 flex w-full flex-col items-center justify-start px-4 py-14 text-center sm:px-8 sm:py-16 lg:px-18 lg:py-20"
      >
        <motion.h2
          id="mustard-warmth-heading"
          variants={item}
          className="font-jost-extrabold text-balance text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)] leading-[1.08] tracking-[0.06em] uppercase drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)]"
          style={{ color: MUSTARD_FIELD_HEADING }}
        >
          {heading}
        </motion.h2>

        {/* whitespace-pre-line keeps the admin's line breaks, which the design
            relies on for the closing line. */}
        <motion.p
          variants={item}
          className="mt-5 font-jost-light max-w-[70ch] text-pretty whitespace-pre-line text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.7] text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.9)] lg:mt-7"
        >
          {paragraph}
        </motion.p>
      </motion.div>
    </section>
  );
}

export function WarmthSectionSkeleton() {
  return (
    <section
      className="relative flex min-h-[60dvh] animate-pulse flex-col items-center justify-start overflow-hidden lg:min-h-dvh"
      style={{ backgroundColor: MUSTARD_WINE }}
    >
      <div className="w-full px-4 py-14 sm:px-8 sm:py-16 lg:px-18 lg:py-20">
        <div className="mx-auto h-9 w-72 rounded-md bg-white/15 sm:h-11 lg:h-14 lg:w-[32rem]" />
        <div className="mx-auto mt-5 max-w-[70ch] space-y-2.5 lg:mt-7">
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-11/12 rounded bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/10" />
        </div>
      </div>
    </section>
  );
}
