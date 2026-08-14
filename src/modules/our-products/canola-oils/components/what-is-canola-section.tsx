'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { CanolaOilsWhatIsContent } from '../types';
import { defaultWhatIsContent } from '../data/defaults';
import { CANOLA_FOREST, CANOLA_SAGE_TEXT } from '../constants';

interface Props {
  data?: CanolaOilsWhatIsContent;
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

/** Feature reveal — lifts and scales in, staggered by the parent container. */
const featureReveal = {
  hidden: { opacity: 0, y: 26, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Section 3 — "WHAT IS CANOLA ?": two-column intro + six-icon feature row. */
export function WhatIsCanolaSection({ data }: Props) {
  const { heading, paragraphLeft, paragraphRight, features } = data ?? defaultWhatIsContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;
  const featureItem = prefersReduced ? reducedMotion : featureReveal;

  return (
    <section
      aria-labelledby="canola-what-is-heading"
      className="flex w-full min-h-dvh items-center px-4 py-14 sm:px-8 sm:py-16 lg:px-18 lg:py-24"
      style={{
        backgroundColor: CANOLA_FOREST,
        // Soft sage copy on the deep green field.
        ['--canola-ink' as string]: CANOLA_SAGE_TEXT,
      }}
    >
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="mx-auto w-full"
      >
        {/* Heading + intro columns */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 2xl:gap-24">
          <div className="min-w-0">
            <motion.h2
              id="canola-what-is-heading"
              variants={item}
              className="font-jost-extrabold text-balance text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)] leading-[1.08] tracking-[0.06em] text-(--canola-ink) uppercase"
            >
              {heading}
            </motion.h2>
            <motion.p
              variants={item}
              className="mt-7 max-w-[62ch] text-pretty text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.75] text-(--canola-ink)/85 lg:mt-9"
            >
              {paragraphLeft}
            </motion.p>
          </div>

          {paragraphRight ? (
            <motion.p
              variants={item}
              className="min-w-0 max-w-[62ch] text-pretty text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.75] text-(--canola-ink)/85 lg:pt-3"
            >
              {paragraphRight}
            </motion.p>
          ) : null}
        </div>

        {/* Feature row — dividers between columns, as in the design. */}
        <div className="mt-14 grid grid-cols-2 gap-x-2 gap-y-12 sm:grid-cols-3 sm:gap-x-4 lg:mt-24 lg:grid-cols-6 lg:gap-y-0">
          {features.map((feature, i) => (
            <motion.article
              key={`${feature.label}-${i}`}
              variants={featureItem}
              className="group min-w-0 px-3 text-center transition-transform duration-500 ease-out hover:-translate-y-1.5 sm:px-5 lg:border-l lg:border-(--canola-ink)/20 lg:first:border-l-0"
            >
              {/* SafeImage resolves empty/unknown values to the upload
                  placeholder, so a feature never renders an empty hole
                  before artwork is set in admin. */}
              <SafeImage
                src={feature.image}
                alt=""
                width={160}
                height={160}
                quality={85}
                sizes="(max-width: 640px) 26vw, (max-width: 1024px) 16vw, 110px"
                className="mx-auto h-[clamp(3.5rem,8vw,5.5rem)] w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
              />
              {/* Designer exception: the "What is canola?" banner is the one
                  place on the product pages that uses Jost Bold Italic. */}
              <h3 className="mt-5 font-jost-bold-italic italic text-[clamp(0.82rem,0.74rem+0.32vw,1rem)] leading-snug text-(--canola-ink)">
                {feature.label}
              </h3>
              {feature.description ? (
                <p className="mt-2.5 text-pretty text-[clamp(0.82rem,0.74rem+0.32vw,1rem)] leading-relaxed text-(--canola-ink)/75">
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
      className="flex w-full min-h-dvh animate-pulse items-center px-4 py-14 sm:px-8 sm:py-16 lg:px-18 lg:py-24"
      style={{ backgroundColor: CANOLA_FOREST }}
    >
      <div className="mx-auto w-full">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 2xl:gap-24">
          <div>
            <div className="h-9 w-64 rounded-md bg-white/15 sm:h-11 lg:h-14 lg:w-96" />
            <div className="mt-7 space-y-2.5 lg:mt-9">
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
        <div className="mt-14 grid grid-cols-2 gap-x-2 gap-y-12 sm:grid-cols-3 sm:gap-x-4 lg:mt-24 lg:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-3 text-center sm:px-5">
              <div className="mx-auto h-[clamp(3.5rem,8vw,5.5rem)] w-[clamp(3.5rem,8vw,5.5rem)] rounded-lg bg-white/10" />
              <div className="mx-auto mt-5 h-3.5 w-24 rounded bg-white/10" />
              <div className="mx-auto mt-2.5 h-3.5 w-20 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
