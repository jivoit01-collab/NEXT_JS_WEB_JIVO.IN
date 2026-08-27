'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { WaterMissionContent } from '../types';
import { defaultMissionContent } from '../data/defaults';
import { WATER_NAVY } from '../constants';

interface Props {
  data?: WaterMissionContent;
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
 * Section 4 — "PROMISING AUTHENTICITY".
 *
 * Copy sits over a full-bleed mountain/waterfall photo using grid stacking
 * (responsive.md §6), so the text stays in normal flow and reflows cleanly.
 * The copy is anchored to the TOP of the frame, per the design.
 */
export function MissionSection({ data }: Props) {
  const { heading, paragraph, backgroundImage } = data ?? defaultMissionContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;

  return (
    <section
      aria-labelledby="water-mission-heading"
      // Half the viewport on phones — a full-height field photo dominates a
      // small screen. Unchanged (full height) from sm up.
      className="relative grid min-h-[50dvh] w-full overflow-hidden [grid-template-areas:'stack'] *:[grid-area:stack] sm:min-h-dvh"
    >
      {/* Background layer — full-bleed, no scrim so the photo reads at full
          contrast. The heading/paragraph carry their own drop-shadows for
          legibility instead. */}
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
          <div className="absolute inset-0" style={{ backgroundColor: WATER_NAVY }} />
        )}
      </div>

      {/* Copy layer — top-aligned */}
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 flex w-full flex-col items-center justify-start px-4 py-10 sm:mt-5 text-center sm:px-6 sm:py-12 md:py-14 lg:px-[5%] lg:py-16 2xl:py-20"
      >
        <motion.h2
          id="water-mission-heading"
          variants={item}
          className="font-jost-extrabold text-balance text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)] leading-[1.08] tracking-[0.06em] uppercase drop-shadow-[0_1px_10px_rgba(255,255,255,0.7)]"
          style={{ color: WATER_NAVY }}
        >
          {heading}
        </motion.h2>

        {/* whitespace-pre-line keeps the admin's line breaks, which the design
            relies on for the three short lines. */}
        <motion.p
          variants={item}
          className="mx-auto mt-4 max-w-[90ch] text-pretty font-jost-light whitespace-pre-line text-[clamp(1.50rem,0.85rem+0.42vw,1.25rem)] leading-[1.3] drop-shadow-[0_1px_10px_rgba(255,255,255,0.7)] lg:mt-5"
          style={{ color: WATER_NAVY }}
        >
          {paragraph}
        </motion.p>
      </motion.div>
    </section>
  );
}

export function MissionSectionSkeleton() {
  return (
    <section
      className="relative flex min-h-[50dvh] animate-pulse flex-col items-center justify-start overflow-hidden sm:min-h-dvh"
      style={{ backgroundColor: WATER_NAVY }}
    >
      <div className="w-full px-4 py-10 sm:px-6 sm:py-12 md:py-14 lg:px-[5%] lg:py-16 2xl:py-20">
        <div className="h-9 w-72 rounded-md bg-white/15 sm:h-11 lg:h-14 lg:w-[32rem]" />
        <div className="mt-5 max-w-[70ch] space-y-2.5 lg:mt-7">
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-11/12 rounded bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/10" />
        </div>
      </div>
    </section>
  );
}
