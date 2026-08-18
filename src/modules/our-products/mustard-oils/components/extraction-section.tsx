'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { MustardOilsExtractionContent } from '../types';
import { defaultExtractionContent } from '../data/defaults';
import { MUSTARD_WINE, MUSTARD_HEADING } from '../constants';

interface Props {
  data?: MustardOilsExtractionContent;
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
 * Mustard-flower artwork — enters from off the right edge and settles with a
 * spring, mirroring the range cards' throw from the left.
 */
const imageReveal = {
  hidden: { opacity: 0, x: 160, rotate: 4 },
  show: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { type: 'spring' as const, stiffness: 70, damping: 18, mass: 1 },
  },
};

/**
 * Section 3 — "GENUINE KACHI GHANI EXTRACTION" + "NUTRITIONAL STRENGTH".
 *
 * Copy runs down the left with the mustard-flower artwork anchored to the
 * section's bottom-right, per the design. The artwork is decorative, so it
 * sits outside the copy flow (responsive.md §6 allows absolute for decoration).
 */
export function ExtractionSection({ data }: Props) {
  const { heading, paragraph, benefitsHeading, benefits, image } =
    data ?? defaultExtractionContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;
  const art = prefersReduced ? reducedMotion : imageReveal;

  return (
    <section
      aria-labelledby="mustard-extraction-heading"
      // Extra bottom padding below lg: the artwork is centred along the bottom
      // there, so the copy needs room to clear it instead of overlapping.
      className="relative flex w-full min-h-dvh items-start overflow-hidden px-4 pt-14 pb-[54%] sm:px-8 sm:pt-16 sm:pb-[58%] lg:items-start lg:px-18 lg:py-24"
      style={{
        backgroundColor: MUSTARD_WINE,
        ['--mustard-heading' as string]: MUSTARD_HEADING,
      }}
    >
      {/* ── Artwork — mustard flowers rising from the lower edge.
          Height-capped (not width-driven) so the top of the flowers starts
          BELOW the first heading rather than level with it. On small screens
          it is centred horizontally instead of pinned right. ── */}
      <motion.div
        variants={art}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        // Pulled further in from the right edge so the flowers sit under the
        // tail of the heading, and made taller so they rise closer to it —
        // closing the gap between the heading and the artwork.
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex h-[52%] justify-center sm:h-[58%] lg:inset-x-auto lg:right-16 lg:h-[82%] lg:justify-end xl:right-24"
      >
        {/* SafeImage resolves empty/unknown values to the upload placeholder. */}
        <SafeImage
          src={image}
          alt=""
          width={900}
          height={900}
          quality={85}
          sizes="(max-width: 640px) 66vw, (max-width: 1024px) 52vw, 34vw"
          className="h-full w-auto max-w-none object-contain object-bottom"
        />
      </motion.div>

      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 w-full"
      >
        <div className="grid grid-cols-1 items-start gap-1">
          <div className="min-w-0">
            <motion.h2
              id="mustard-extraction-heading"
              variants={item}
              className="font-jost-extrabold text-balance text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)] leading-[1.08] tracking-[0.06em] text-(--mustard-heading) uppercase"
            >
              {heading}
            </motion.h2>

            {/* Measure capped so the copy clears the artwork on wide screens. */}
            <motion.p
              variants={item}
              className="mt-7 max-w-[62ch] font-jost-light text-pretty text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.75] text-white/90 lg:mt-9"
            >
              {paragraph}
            </motion.p>

            {benefitsHeading ? (
              <motion.h3
                variants={item}
                className="mt-12 font-jost-extrabold text-[clamp(1.35rem,1rem+1.6vw,2.5rem)] leading-[1.1] tracking-[0.06em] text-(--mustard-heading) uppercase lg:mt-16"
              >
                {benefitsHeading}
              </motion.h3>
            ) : null}

            {/* No measure cap: the artwork sits low on the right, so the list
                has the full width and each point fits on ONE line at lg+.
                Below lg it wraps normally rather than overflowing. */}
            <motion.ul variants={item} className="mt-6 space-y-3.5">
              {benefits.map((benefit, i) => (
                <li
                  key={i}
                  className="flex min-w-0 font-jost-light items-start gap-2.5 text-[clamp(0.9rem,0.8rem+0.38vw,1.15rem)] leading-[1.7] text-white/90"
                >
                  <span
                    aria-hidden
                    className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-white/70"
                  />
                  <span className="min-w-0 lg:whitespace-nowrap">{benefit}</span>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export function ExtractionSectionSkeleton() {
  return (
    <section
      className="flex w-full min-h-dvh animate-pulse items-center px-4 py-14 sm:px-8 sm:py-16 lg:px-18 lg:py-24"
      style={{ backgroundColor: MUSTARD_WINE }}
    >
      <div className="w-full">
        <div className="h-9 w-72 rounded-md bg-white/15 sm:h-11 lg:h-14 lg:w-[34rem]" />
        <div className="mt-7 max-w-[62ch] space-y-2.5 lg:mt-9">
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-11/12 rounded bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/10" />
        </div>
        <div className="mt-12 h-8 w-56 rounded-md bg-white/15 sm:h-10 lg:mt-16" />
        <div className="mt-6 max-w-[62ch] space-y-3.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-full rounded bg-white/10" />
          ))}
        </div>
      </div>
    </section>
  );
}
