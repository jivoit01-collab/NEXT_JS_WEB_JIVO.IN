'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { CanolaOilsScienceContent } from '../types';
import { defaultScienceContent } from '../data/defaults';
import { CANOLA_CREAM } from '../constants';

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
      className="relative grid overflow-hidden [grid-template-areas:'stack'] *:[grid-area:stack]"
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
        <div aria-hidden="true" className="absolute inset-0 bg-black/35" />
      </div>

      {/* Copy layer */}
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
      >
        <motion.h2
          id="canola-science-heading"
          variants={item}
          className="font-jost-extrabold text-balance text-2xl tracking-[0.06em] text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:text-3xl lg:text-4xl"
        >
          {heading}
        </motion.h2>

        <motion.p
          variants={item}
          className="mt-6 max-w-[65ch] text-pretty text-sm leading-relaxed text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] sm:text-base"
        >
          {intro}
        </motion.p>

        {subheading ? (
          <motion.h3
            variants={item}
            className="mt-10 font-jost-bold text-lg drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-xl lg:text-2xl"
            style={{ color: CANOLA_CREAM }}
          >
            {subheading}
          </motion.h3>
        ) : null}

        <motion.ul variants={item} className="mt-5 max-w-[65ch] space-y-2">
          {points.map((point, i) => (
            <li
              key={i}
              className="text-pretty text-sm leading-relaxed text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] sm:text-base"
            >
              {point}
            </li>
          ))}
        </motion.ul>

        {closingLine ? (
          <motion.p
            variants={item}
            className="mt-8 max-w-[65ch] text-pretty text-sm leading-relaxed text-white/90 italic drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] sm:text-base"
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
    <section className="relative animate-pulse overflow-hidden bg-[#2f6f63]">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="h-8 w-72 rounded-md bg-white/15 sm:h-9 lg:h-10 lg:w-[28rem]" />
        <div className="mt-6 max-w-[65ch] space-y-2">
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-11/12 rounded bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/10" />
        </div>
        <div className="mt-10 h-6 w-56 rounded bg-white/15 sm:h-7" />
        <div className="mt-5 max-w-[65ch] space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-full rounded bg-white/10" />
          ))}
        </div>
        <div className="mt-8 h-4 w-2/3 max-w-sm rounded bg-white/10" />
      </div>
    </section>
  );
}
