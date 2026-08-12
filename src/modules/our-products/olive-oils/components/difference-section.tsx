'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { OliveOilsDifferenceContent } from '../types';
import { defaultDifferenceContent } from '../data/defaults';
import { OLIVE_LIGHT } from '../constants';

interface Props {
  data?: OliveOilsDifferenceContent;
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
 * Section 5 — "THE JIVO DIFFERENCE".
 *
 * Copy sits over a full-bleed olive-grove photo using grid stacking
 * (responsive.md §6), so the text stays in normal flow and reflows cleanly.
 * The copy is centred and anchored near the top of the frame, per the design.
 */
export function DifferenceSection({ data }: Props) {
  const { heading, paragraph, backgroundImage } = data ?? defaultDifferenceContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;

  return (
    <section
      aria-labelledby="olive-difference-heading"
      className="relative grid min-h-[60dvh] w-full overflow-hidden [grid-template-areas:'stack'] *:[grid-area:stack] lg:min-h-dvh"
    >
      {/* Background layer — full-bleed grove photo. */}
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
          <div className="absolute inset-0" style={{ backgroundColor: OLIVE_LIGHT }} />
        )}
      </div>

      {/* Copy layer — centred, anchored toward the top of the frame. The
          heading is dark (per the design) over a bright sky, so it carries a
          light text-shadow rather than a dark one. */}
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 flex w-full flex-col items-center justify-start px-4 py-14 text-center sm:px-8 sm:py-16 lg:px-18 lg:py-20"
      >
        <motion.h2
          id="olive-difference-heading"
          variants={item}
          className="font-jost-extrabold text-balance text-[clamp(1.5rem,1.05rem+1.9vw,2.75rem)] leading-[1.12] tracking-[0.06em] text-[#1f3d22] uppercase drop-shadow-[0_1px_10px_rgba(255,255,255,0.55)]"
        >
          {heading}
        </motion.h2>

        {/* whitespace-pre-line keeps the admin's line breaks, which the design
            relies on for the closing lines. */}
        <motion.p
          variants={item}
          className="mt-5 max-w-[72ch] text-pretty whitespace-pre-line text-[clamp(0.9rem,0.82rem+0.34vw,1.125rem)] leading-[1.75] text-[#616C3E] drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)] lg:mt-7"
        >
          {paragraph}
        </motion.p>
      </motion.div>
    </section>
  );
}

export function DifferenceSectionSkeleton() {
  return (
    <section
      className="relative flex min-h-[60dvh] animate-pulse flex-col items-center justify-start overflow-hidden lg:min-h-dvh"
      style={{ backgroundColor: OLIVE_LIGHT }}
    >
      <div className="w-full px-4 py-14 sm:px-8 sm:py-16 lg:px-18 lg:py-20">
        <div className="mx-auto h-8 w-64 rounded-md bg-white/15 sm:h-10 lg:h-12 lg:w-[24rem]" />
        <div className="mx-auto mt-5 max-w-[72ch] space-y-2.5 lg:mt-7">
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-11/12 rounded bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/10" />
        </div>
      </div>
    </section>
  );
}
