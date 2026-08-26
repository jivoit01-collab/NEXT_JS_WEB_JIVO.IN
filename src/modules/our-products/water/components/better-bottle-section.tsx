'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { WaterBetterBottleContent } from '../types';
import { defaultBetterBottleContent } from '../data/defaults';
import { WATER_BLUE, WATER_CREAM,WATER_CREAM_ALT } from '../constants';

interface Props {
  data?: WaterBetterBottleContent;
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

/** Section 3 — "A BETTER BOTTLE, INSIDE AND OUT": two-column intro + icon feature row. */
export function BetterBottleSection({ data }: Props) {
  const { heading, paragraphLeft, paragraphRight, features } = data ?? defaultBetterBottleContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;
  const featureItem = prefersReduced ? reducedMotion : featureReveal;

  return (
    <section
      aria-labelledby="water-betterbottle-heading"
      // The design keeps ~10% breathing room each side, so padding scales with
      // the viewport instead of stopping at a fixed value.
      className="flex w-full min-h-dvh items-center px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:px-[7%] lg:py-24 2xl:px-[9%] 2xl:py-28"
      style={{
        backgroundColor: WATER_BLUE,
        // Soft sage copy on the deep green field.
        ['--water-ink' as string]: WATER_CREAM,
      }}
    >
      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        // Wide enough to match the design's proportions on a large monitor
        // (the reference canvas is ~1440-1600px, where the content block is
        // ~1150-1290px), while still capped so it never stretches indefinitely.
        className="mx-auto w-full max-w-400"
      >
        {/* Full-width heading on top (one line on desktop), then the two
            paragraphs in a 2-column grid below it — matching the design. */}
        <motion.h2
          id="water-betterbottle-heading"
          variants={item}
          className="font-jost-extrabold text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)] leading-[1.08] tracking-[0.06em] text-(--water-ink) uppercase lg:whitespace-nowrap"
        >
          {heading}
        </motion.h2>

        {/* whitespace-pre-line preserves the admin's line breaks (Enter) —
            without it, `\n` collapses to a single space. */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:mt-10 lg:gap-24 2xl:gap-28">
          <motion.p
            variants={item}
            className="min-w-0 font-jost-light max-w-[62ch] text-pretty whitespace-pre-line text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.75] text-(--water-ink)/85"
          >
            {paragraphLeft}
          </motion.p>

          {paragraphRight ? (
            <motion.p
              variants={item}
              className="min-w-0 font-jost-light max-w-[62ch] text-pretty whitespace-pre-line text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.75] text-(--water-ink)/85"
            >
              {paragraphRight}
            </motion.p>
          ) : null}
        </div>

        {/* Feature row — CENTERED as a group (not spread edge-to-edge), matching
            the design. A capped max-width + mx-auto holds the three columns in
            the middle, with a full-height divider between them. */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 items-stretch justify-center gap-x-2 gap-y-12 sm:grid-cols-3 sm:gap-x-4 md:mt-20 md:gap-x-6 lg:mt-24 lg:gap-x-0 lg:gap-y-0 2xl:mt-28">
          {features.map((feature, i) => (
            <motion.article
              key={`${feature.label}-${i}`}
              variants={featureItem}
              className="group h-full min-w-0 px-3 pt-1 text-center transition-transform duration-500 ease-out hover:-translate-y-1.5 sm:px-5 lg:px-8 lg:border-l lg:border-(--water-ink)/25 lg:first:border-l-0"
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
              {/* Feature label styling for the water page.
                  place on the product pages that uses Jost Bold Italic. */}
              <h3 
              className="mt-5 font-jost-bold-italic italic text-[clamp(0.82rem,0.74rem+0.32vw,1rem)] leading-snug"
              style={{ color: WATER_CREAM_ALT }} 
              >
                {feature.label}
              </h3>
              {feature.description ? (
                <p className="mt-2.5 font-jost-light text-pretty text-[clamp(0.82rem,0.74rem+0.32vw,1rem)] leading-relaxed"
                style={{ color: WATER_CREAM_ALT }} 
                >
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

export function BetterBottleSectionSkeleton() {
  return (
    <section
      className="flex w-full min-h-dvh animate-pulse items-center px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:px-[7%] lg:py-24 2xl:px-[9%] 2xl:py-28"
      style={{ backgroundColor: WATER_BLUE }}
    >
      <div className="mx-auto w-full max-w-400">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-24 2xl:gap-28">
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
        <div className="mt-16 grid grid-cols-2 gap-x-2 gap-y-12 sm:grid-cols-3 sm:gap-x-4 md:mt-20 md:gap-x-6 lg:mt-28 lg:grid-cols-6 2xl:mt-32">
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
