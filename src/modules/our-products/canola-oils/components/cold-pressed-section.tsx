'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { CanolaOilsColdPressedContent } from '../types';
import { defaultColdPressedContent } from '../data/defaults';
import { CANOLA_TAUPE, CANOLA_CREAM } from '../constants';

interface Props {
  data?: CanolaOilsColdPressedContent;
}

/** Section 5 — "WHY COLD-PRESSED": lead copy + two comparison columns. */
export function ColdPressedSection({ data }: Props) {
  const {
    heading,
    leadLineOne,
    leadLineTwo,
    paragraph,
    coldPressedTitle,
    coldPressedPoints,
    refinedTitle,
    refinedPoints,
  } = data ?? defaultColdPressedContent;

  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : fadeUp;

  return (
    <section
      aria-labelledby="canola-cold-pressed-heading"
      className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
      style={{ backgroundColor: CANOLA_TAUPE }}
    >
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto w-full max-w-6xl"
      >
        <motion.h2
          id="canola-cold-pressed-heading"
          variants={item}
          className="font-jost-extrabold text-balance text-2xl tracking-[0.06em] text-white uppercase sm:text-3xl lg:text-4xl"
        >
          {heading}
        </motion.h2>

        <motion.p
          variants={item}
          className="mt-6 max-w-[65ch] text-pretty font-jost-medium text-sm leading-relaxed sm:text-base"
          style={{ color: CANOLA_CREAM }}
        >
          {leadLineOne}
        </motion.p>
        {leadLineTwo ? (
          <motion.p
            variants={item}
            className="max-w-[65ch] text-pretty font-jost-medium text-sm leading-relaxed sm:text-base"
            style={{ color: CANOLA_CREAM }}
          >
            {leadLineTwo}
          </motion.p>
        ) : null}

        {paragraph ? (
          <motion.p
            variants={item}
            className="mt-5 max-w-[65ch] text-pretty text-sm leading-relaxed text-white/85 sm:text-base"
          >
            {paragraph}
          </motion.p>
        ) : null}

        {/* Comparison columns */}
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:mt-16 lg:gap-16">
          <ComparisonColumn title={coldPressedTitle} points={coldPressedPoints} variants={item} />
          <ComparisonColumn title={refinedTitle} points={refinedPoints} variants={item} />
        </div>
      </motion.div>
    </section>
  );
}

function ComparisonColumn({
  title,
  points,
  variants,
}: {
  title: string;
  points: string[];
  variants: typeof fadeUp;
}) {
  return (
    <motion.div variants={variants} className="min-w-0">
      <h3
        className="font-jost-bold text-lg sm:text-xl lg:text-2xl"
        style={{ color: CANOLA_CREAM }}
      >
        {title}
      </h3>
      <ul className="mt-5 space-y-2.5">
        {points.map((point, i) => (
          <li
            key={i}
            className="min-w-0 text-pretty text-sm leading-relaxed text-white/85 transition-colors duration-300 hover:text-white sm:text-base"
          >
            {point}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function ColdPressedSectionSkeleton() {
  return (
    <section
      className="animate-pulse px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
      style={{ backgroundColor: CANOLA_TAUPE }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="h-8 w-64 rounded-md bg-white/15 sm:h-9 lg:h-10 lg:w-80" />
        <div className="mt-6 space-y-2">
          <div className="h-4 w-full max-w-md rounded bg-white/15" />
          <div className="h-4 w-full max-w-lg rounded bg-white/15" />
        </div>
        <div className="mt-5 space-y-2">
          <div className="h-4 w-full max-w-xl rounded bg-white/10" />
          <div className="h-4 w-3/4 max-w-lg rounded bg-white/10" />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:mt-16 lg:gap-16">
          {[0, 1].map((col) => (
            <div key={col}>
              <div className="h-6 w-44 rounded bg-white/15 sm:h-7" />
              <div className="mt-5 space-y-2.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 w-full rounded bg-white/10" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
