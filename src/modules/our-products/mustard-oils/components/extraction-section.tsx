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
      className="relative flex min-h-dvh w-full flex-col justify-center overflow-hidden px-4 py-12 sm:px-6 sm:py-14 md:py-16 lg:px-[6%] lg:py-20 2xl:py-24"
      style={{
        backgroundColor: MUSTARD_WINE,
        ['--mustard-heading' as string]: MUSTARD_HEADING,
      }}
    >
      {/* ONE shared box: copy + artwork. The artwork is absolute WITHIN this
          box (not the section), so their relationship is fixed and the pair
          centres together at any zoom or screen size. */}
      <div className="relative mx-auto flex w-full max-w-[160rem] flex-1 flex-col justify-center">
        <motion.div
          variants={art}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          // Artwork — mustard flowers. Stacked under the copy and centred below
          // lg; absolute inside the shared box from lg up. Width is
          // clamp(rem, vw, rem): the vw term scales across monitors, the rem
          // bounds make browser zoom actually change the size (plain vw does
          // not, since zoom redefines the CSS pixel).
          style={{ width: 'clamp(11rem, 30%, 76rem)' }}
        className="pointer-events-none order-2 z-0 mx-auto -mb-12 mt-6 flex h-auto justify-center sm:-mb-14 md:-mb-16 lg:absolute lg:right-[2%] lg:bottom-[-5rem] lg:order-none lg:mx-0 lg:mt-0 lg:mb-0 lg:items-end lg:justify-end 2xl:bottom-[-6rem]"
        >
          {/* SafeImage resolves empty/unknown values to the upload placeholder. */}
          <SafeImage
            src={image}
            alt=""
            width={900}
            height={900}
            quality={85}
            sizes="(max-width: 640px) 60vw, (max-width: 1024px) 46vw, 30vw"
            className="h-auto w-full object-contain object-bottom"
          />
        </motion.div>

        <motion.div
          variants={prefersReduced ? reducedMotion : container}
          initial="hidden"
          whileInView="show"
          viewport={defaultViewport}
          className="relative z-10 order-1 w-full lg:order-none"
        >
          <div className="grid grid-cols-1 items-start gap-1 lg:w-[65%]">
            <div className="min-w-0">
              <motion.h2
                id="mustard-extraction-heading"
                variants={item}
                className="font-jost-extrabold text-[clamp(1.5rem,1.1rem+2.6vw,3.5rem)] leading-[1.08] tracking-[0.06em] text-(--mustard-heading) uppercase lg:whitespace-nowrap"
              >
                {heading}
              </motion.h2>

              {/* Measure capped so the copy clears the artwork on wide screens. */}
              <motion.p
                variants={item}
                className="mt-7 w-full font-jost-light text-pretty text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.75] text-white/90 lg:mt-9"
              >
                {paragraph}
              </motion.p>

              {benefitsHeading ? (
                <motion.h3
                  variants={item}
                  className="mt-12 font-jost-extrabold text-[clamp(1.35rem,1rem+1.6vw,2.5rem)] leading-[1.1] tracking-[0.06em] text-(--mustard-heading) uppercase lg:mt-16 lg:whitespace-nowrap"
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
      </div>
    </section>
  );
}

export function ExtractionSectionSkeleton() {
  return (
    <section
      className="relative flex min-h-dvh w-full flex-col justify-center animate-pulse overflow-hidden px-4 py-12 sm:px-6 sm:py-14 md:py-16 lg:px-[6%] lg:py-20 2xl:py-24"
      style={{ backgroundColor: MUSTARD_WINE }}
    >
      <div className="w-full lg:w-[65%]">
        <div className="h-9 w-72 rounded-md bg-white/15 sm:h-11 lg:h-14 lg:w-[34rem]" />
        <div className="mt-7 w-full space-y-2.5 lg:mt-9">
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-11/12 rounded bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/10" />
        </div>
        <div className="mt-12 h-8 w-56 rounded-md bg-white/15 sm:h-10 lg:mt-16" />
        <div className="mt-6 w-full space-y-3.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-full rounded bg-white/10" />
          ))}
        </div>
      </div>
    </section>
  );
}
