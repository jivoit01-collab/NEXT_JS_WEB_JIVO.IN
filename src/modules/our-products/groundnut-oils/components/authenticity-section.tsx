'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { GroundnutOilsAuthenticityContent } from '../types';
import { defaultAuthenticityContent } from '../data/defaults';
import { GROUNDNUT_AMBER, GROUNDNUT_WHEAT } from '../constants';

interface Props {
  data?: GroundnutOilsAuthenticityContent;
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
 * Copy sits over a full-bleed groundnut-field photo using grid stacking
 * (responsive.md §6), so the text stays in normal flow and reflows cleanly.
 * The copy is anchored to the TOP of the frame, per the design.
 */
export function AuthenticitySection({ data }: Props) {
  const { heading, paragraph, backgroundImage } = data ?? defaultAuthenticityContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;

  return (
    <section
      aria-labelledby="groundnut-authenticity-heading"
      className="relative grid min-h-dvh w-full overflow-hidden [grid-template-areas:'stack'] *:[grid-area:stack]"
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
          <div className="absolute inset-0" style={{ backgroundColor: GROUNDNUT_AMBER }} />
        )}
      </div>

      {/* Copy layer — top-aligned */}
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 flex w-full flex-col justify-start px-4 py-14 sm:px-8 sm:py-16 lg:px-18 lg:py-20"
      >
        <motion.h2
          id="groundnut-authenticity-heading"
          variants={item}
          className="font-jost-extrabold text-balance text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)] leading-[1.08] tracking-[0.06em] uppercase drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)]"
          style={{ color: GROUNDNUT_WHEAT }}
        >
          {heading}
        </motion.h2>

        {/* whitespace-pre-line keeps the admin's line breaks, which the design
            relies on for the three short lines. */}
        <motion.p
          variants={item}
          className="mt-5 max-w-[70ch] text-pretty whitespace-pre-line text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.7] text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.9)] lg:mt-7"
        >
          {paragraph}
        </motion.p>
      </motion.div>
    </section>
  );
}

export function AuthenticitySectionSkeleton() {
  return (
    <section
      className="relative flex min-h-dvh animate-pulse flex-col justify-start overflow-hidden"
      style={{ backgroundColor: GROUNDNUT_AMBER }}
    >
      <div className="w-full px-4 py-14 sm:px-8 sm:py-16 lg:px-18 lg:py-20">
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
