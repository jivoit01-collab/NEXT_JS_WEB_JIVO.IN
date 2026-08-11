'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { container, fadeUp, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import { FeatureIcon } from './feature-icon';
import type { CanolaOilsWhatIsContent } from '../types';
import { defaultWhatIsContent } from '../data/defaults';
import { CANOLA_FOREST, CANOLA_CREAM } from '../constants';

interface Props {
  data?: CanolaOilsWhatIsContent;
}

/** Section 3 — "WHAT IS CANOLA ?": two-column intro + six-icon feature row. */
export function WhatIsCanolaSection({ data }: Props) {
  const { heading, paragraphLeft, paragraphRight, features } = data ?? defaultWhatIsContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : fadeUp;

  return (
    <section
      aria-labelledby="canola-what-is-heading"
      className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
      style={{ backgroundColor: CANOLA_FOREST }}
    >
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto w-full max-w-6xl"
      >
        {/* Heading + intro columns */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0">
            <motion.h2
              id="canola-what-is-heading"
              variants={item}
              className="font-jost-extrabold text-balance text-2xl tracking-[0.06em] uppercase sm:text-3xl lg:text-4xl"
              style={{ color: CANOLA_CREAM }}
            >
              {heading}
            </motion.h2>
            <motion.p
              variants={item}
              className="mt-6 max-w-[65ch] text-pretty text-sm leading-relaxed text-white/85 sm:text-base"
            >
              {paragraphLeft}
            </motion.p>
          </div>

          {paragraphRight ? (
            <motion.p
              variants={item}
              className="min-w-0 max-w-[65ch] text-pretty text-sm leading-relaxed text-white/85 sm:text-base lg:pt-2"
            >
              {paragraphRight}
            </motion.p>
          ) : null}
        </div>

        {/* Feature row — dividers between columns, as in the design. */}
        <div className="mt-14 grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:mt-20 lg:grid-cols-6 lg:gap-y-0">
          {features.map((feature, i) => (
            <motion.article
              key={`${feature.label}-${i}`}
              variants={item}
              className="group min-w-0 px-3 text-center transition-transform duration-500 ease-out hover:-translate-y-1.5 sm:px-4 lg:border-l lg:border-white/15 lg:first:border-l-0"
              style={{ ['--canola-cream' as string]: CANOLA_CREAM }}
            >
              <FeatureIcon
                name={feature.icon}
                className="mx-auto h-9 w-9 text-[color:var(--canola-cream)] transition-transform duration-500 ease-out group-hover:scale-110 sm:h-10 sm:w-10"
              />
              <h3
                className="mt-4 font-jost-medium text-xs italic leading-snug sm:text-sm"
                style={{ color: CANOLA_CREAM }}
              >
                {feature.label}
              </h3>
              {feature.description ? (
                <p className="mt-2 text-pretty text-[11px] leading-relaxed text-white/70 sm:text-xs">
                  {feature.description}
                </p>
              ) : null}
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export function WhatIsCanolaSectionSkeleton() {
  return (
    <section
      className="animate-pulse px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
      style={{ backgroundColor: CANOLA_FOREST }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <div className="h-8 w-64 rounded-md bg-white/15 sm:h-9 lg:h-10 lg:w-80" />
            <div className="mt-6 space-y-2">
              <div className="h-4 w-full rounded bg-white/10" />
              <div className="h-4 w-11/12 rounded bg-white/10" />
              <div className="h-4 w-4/5 rounded bg-white/10" />
            </div>
          </div>
          <div className="space-y-2 lg:pt-2">
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-11/12 rounded bg-white/10" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
          </div>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:mt-20 lg:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-3 text-center sm:px-4">
              <div className="mx-auto h-9 w-9 rounded-full bg-white/10 sm:h-10 sm:w-10" />
              <div className="mx-auto mt-4 h-3 w-20 rounded bg-white/10" />
              <div className="mx-auto mt-2 h-3 w-16 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
