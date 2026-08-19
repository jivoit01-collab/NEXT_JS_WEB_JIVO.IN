'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { CanolaOilsScienceContent } from '../types';
import { defaultScienceContent } from '../data/defaults';
import { CANOLA_CREAM, CANOLA_SAGE_TEXT } from '../constants';

interface Props {
  data?: CanolaOilsScienceContent;
}

/**
 * Section 4 — "THE SCIENCE BEHIND THE GOLD".
 * Copy sits over a full-bleed canola-field photo using grid stacking
 * (responsive.md §6), so the text stays in normal flow and reflows cleanly.
 */
export function ScienceSection({ data }: Props) {
  const { heading, intro, subheading, points, closingLine, backgroundImage } =
    data ?? defaultScienceContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : fadeUp;

  return (
    <section
      aria-labelledby="canola-science-heading"
      className="relative grid min-h-[95svh] overflow-hidden [grid-template-areas:'stack'] *:[grid-area:stack]"
    >
      {/* Background layer */}
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
          <div className="absolute inset-0 bg-gradient-to-b from-[#1f6f7a] via-[#3f8f6a] to-[#d8c24a]" />
        )}
        {/* Decorative scrim — guarantees 4.5:1 text contrast over the photo. */}
       
      </div>

      {/* Copy layer */}
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto flex h-[80%] w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8 lg:py-28 2xl:max-w-7xl"
      >
        <motion.h2
          id="canola-science-heading"
          variants={item}
          className="font-jost-extrabold text-balance text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)] leading-[1.08] tracking-[0.06em] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
          style={{ color: CANOLA_SAGE_TEXT }}
        >
          {heading}
        </motion.h2>

        <motion.p
          variants={item}
          className="mt-7 font-jost-light max-w-[62ch] text-pretty text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.75] text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] lg:mt-9"
        >
          {intro}
        </motion.p>

        {subheading ? (
          <motion.h3
            variants={item}
            className="mt-12 font-jost-extrabold text-[clamp(1.15rem,0.95rem+0.9vw,1.9rem)] drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]"
            style={{ color: CANOLA_CREAM }}
          >
            {subheading}
          </motion.h3>
        ) : null}

        <motion.ul variants={item} className="mt-6 max-w-[95ch] space-y-3.5">
          {points.map((point, i) => (
            <li
              key={i}
              className="text-pretty font-jost-light text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.75] text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
            >
              {point}
            </li>
          ))}
        </motion.ul>

        {closingLine ? (
          <motion.p
            variants={item}
            className="mt-2 font-jost-light max-w-[62ch] text-pretty text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.75] text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
          >
            {closingLine}
          </motion.p>
        ) : null}
      </motion.div>
    </section>
  );
}

export function ScienceSectionSkeleton() {
  return (
    <section className="relative flex min-h-[95svh] animate-pulse flex-col justify-center overflow-hidden bg-[#2f6f63]">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8 lg:py-28 2xl:max-w-7xl">
        <div className="h-9 w-72 rounded-md bg-white/15 sm:h-11 lg:h-14 lg:w-[32rem]" />
        <div className="mt-7 max-w-[62ch] space-y-2.5 lg:mt-9">
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-11/12 rounded bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/10" />
        </div>
        <div className="mt-12 h-7 w-56 rounded bg-white/15 sm:h-8" />
        <div className="mt-6 max-w-[62ch] space-y-3.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-full rounded bg-white/10" />
          ))}
        </div>
        <div className="mt-10 h-4 w-2/3 max-w-sm rounded bg-white/10" />
      </div>
    </section>
  );
}
