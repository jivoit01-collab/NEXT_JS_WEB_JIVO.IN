'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { GroundnutOilsGoodnessContent } from '../types';
import { defaultGoodnessContent } from '../data/defaults';
import { GROUNDNUT_AMBER, GROUNDNUT_WHEAT } from '../constants';

interface Props {
  data?: GroundnutOilsGoodnessContent;
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
 * Artwork throw-in — enters from off the right edge and settles with a spring,
 * mirroring the range cards' throw from the left.
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
 * Section 3 — "THE GOODNESS WITHIN".
 *
 * Copy column on the left, groundnut artwork on the right. Uses a normal
 * grid (responsive.md §6) rather than absolute positioning, so the two
 * columns stack cleanly on mobile.
 */
export function GoodnessSection({ data }: Props) {
  const { heading, paragraph, benefitsHeading, benefits, image } = data ?? defaultGoodnessContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;
  const art = prefersReduced ? reducedMotion : imageReveal;

  return (
    <section
      aria-labelledby="groundnut-goodness-heading"
      className="relative w-full overflow-hidden px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-14 md:pb-16 lg:flex lg:items-start lg:px-[6%] lg:py-20 2xl:py-24"
      style={{
        backgroundColor: GROUNDNUT_AMBER,
        ['--groundnut-wheat' as string]: GROUNDNUT_WHEAT,
      }}
    >
      {/* ── Artwork — pinned flush to the section's top-right corner, so it
          reads as entering from the edge with no surrounding gap. Decorative,
          so it sits outside the copy flow (responsive.md §6 allows absolute
          for decoration). ── */}
      <motion.div
        variants={art}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="pointer-events-none relative z-0 ml-auto mb-2 w-[62vw] max-w-80 sm:mb-4 sm:w-[56vw] sm:max-w-96 md:w-[50vw] md:max-w-[28rem] lg:absolute lg:top-0 lg:right-0 lg:mb-0 lg:w-[40vw] lg:max-w-none"
      >
        {/* SafeImage resolves empty/unknown values to the upload placeholder. */}
        <SafeImage
          src={image}
          alt=""
          width={900}
          height={900}
          quality={85}
          sizes="(max-width: 640px) 62vw, (max-width: 1024px) 50vw, 40vw"
          className="h-auto w-full object-contain lg:object-right-top"
        />
      </motion.div>

      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 w-full"
      >
        <div className="grid grid-cols-1 items-start gap-10 lg:w-[52%]">
          {/* ── Copy column. The heading and paragraph clear the artwork; the
              benefits list is allowed to run wider (the artwork sits in the
              upper-right, so the lower rows have the full width). ── */}
          <div className="min-w-0">
            <motion.h2
              id="groundnut-goodness-heading"
              variants={item}
              className="font-jost-extrabold text-balance text-[clamp(1.75rem,1.1rem+2.6vw,3.5rem)] leading-[1.08] tracking-[0.06em] text-(--groundnut-wheat) uppercase"
            >
              {heading}
            </motion.h2>

            <motion.p
              variants={item}
              className="mt-7 w-full font-jost-light text-pretty text-[clamp(0.95rem,0.85rem+0.42vw,1.3rem)] leading-[1.75] text-white/90 lg:mt-9"
            >
              {paragraph}
            </motion.p>

            {benefitsHeading ? (
              <motion.h3
                variants={item}
                className="mt-12 font-jost-extrabold text-[clamp(1.35rem,1rem+1.6vw,2.5rem)] leading-[1.1] tracking-[0.06em] text-(--groundnut-wheat) uppercase lg:mt-16"
              >
                {benefitsHeading}
              </motion.h3>
            ) : null}

            {/* No measure cap — each benefit should sit on a single line on
                desktop, so the list is allowed the full copy-column width. */}
            <motion.ul variants={item} className="mt-6 space-y-3.5">
              {benefits.map((benefit, i) => (
                <li
                  key={i}
                  className="flex min-w-0 font-jost-light items-start gap-2.5 text-[clamp(0.9rem,0.8rem+0.38vw,1.15rem)] leading-[1.7] text-white/90"
                >
                  <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-white/70" />
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

export function GoodnessSectionSkeleton() {
  return (
    <section
      className="relative w-full animate-pulse overflow-hidden px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-14 md:pb-16 lg:flex lg:items-start lg:px-[6%] lg:py-20 2xl:py-24"
      style={{ backgroundColor: GROUNDNUT_AMBER }}
    >
      {/* Artwork placeholder — pinned like the real one. */}
      <div className="pointer-events-none relative z-0 ml-auto mb-2 w-[62vw] max-w-80 sm:mb-4 sm:w-[56vw] sm:max-w-96 md:w-[50vw] md:max-w-[28rem] lg:absolute lg:top-0 lg:right-0 lg:mb-0 lg:w-[40vw] lg:max-w-none">
        <div className="aspect-square w-full bg-white/10" />
      </div>

      <div className="relative z-10 w-full">
        <div className="lg:w-[52%]">
          <div className="h-9 w-72 rounded-md bg-white/15 sm:h-11 lg:h-14 lg:w-[30rem]" />
          <div className="mt-7 w-full space-y-2.5 lg:mt-9">
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-11/12 rounded bg-white/10" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
          </div>
          <div className="mt-10 h-8 w-44 rounded-md bg-white/15 sm:h-10 lg:mt-14" />
          <div className="mt-5 space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-full rounded bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
