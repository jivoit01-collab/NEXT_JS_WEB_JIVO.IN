'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { CanolaOilsColdPressedContent } from '../types';
import { defaultColdPressedContent } from '../data/defaults';
import { CANOLA_MOCHA, CANOLA_CREAM, CANOLA_SAGE_TEXT } from '../constants';

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
      className="flex w-full min-h-dvh items-center px-4 py-14 sm:px-8 sm:py-16 lg:px-18 lg:py-24"
      style={{ backgroundColor: CANOLA_MOCHA }}
    >
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="w-full"
      >
        <motion.h2
          id="canola-cold-pressed-heading"
          variants={item}
          className="font-jost-extrabold text-balance text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)] leading-[1.08] tracking-[0.06em] uppercase"
          style={{ color: CANOLA_SAGE_TEXT }}
        >
          {heading}
        </motion.h2>

        <motion.p
          variants={item}
          className="mt-7 max-w-[62ch] text-pretty font-jost-medium text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.7] lg:mt-9"
          style={{ color: CANOLA_CREAM }}
        >
          {leadLineOne}
        </motion.p>
        {leadLineTwo ? (
          <motion.p
            variants={item}
            className="max-w-[62ch] text-pretty font-jost-medium text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.7]"
            style={{ color: CANOLA_CREAM }}
          >
            {leadLineTwo}
          </motion.p>
        ) : null}

        {paragraph ? (
          <motion.p
            variants={item}
            className="mt-6 max-w-[62ch] text-pretty text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.75] text-white/85"
          >
            {paragraph}
          </motion.p>
        ) : null}

        {/* Comparison columns */}
        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14 lg:mt-20 lg:gap-24">
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
        className="font-jost-bold text-[clamp(1.15rem,0.95rem+0.9vw,1.9rem)]"
        style={{ color: CANOLA_CREAM }}
      >
        {title}
      </h3>
      <ul className="mt-6 space-y-4">
        {points.map((point, i) => (
          <li
            key={i}
            className="min-w-0 text-pretty text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.7] text-white/85 transition-colors duration-300 hover:text-white"
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
      className="flex w-full min-h-dvh animate-pulse items-center px-4 py-14 sm:px-8 sm:py-16 lg:px-18 lg:py-24"
      style={{ backgroundColor: CANOLA_MOCHA }}
    >
      <div className="w-full">
        <div className="h-9 w-64 rounded-md bg-white/15 sm:h-11 lg:h-14 lg:w-96" />
        <div className="mt-7 space-y-2.5 lg:mt-9">
          <div className="h-4 w-full max-w-md rounded bg-white/15" />
          <div className="h-4 w-full max-w-lg rounded bg-white/15" />
        </div>
        <div className="mt-6 space-y-2.5">
          <div className="h-4 w-full max-w-xl rounded bg-white/10" />
          <div className="h-4 w-3/4 max-w-lg rounded bg-white/10" />
        </div>
        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14 lg:mt-20 lg:gap-24">
          {[0, 1].map((col) => (
            <div key={col}>
              <div className="h-7 w-44 rounded bg-white/15 sm:h-8" />
              <div className="mt-6 space-y-4">
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
