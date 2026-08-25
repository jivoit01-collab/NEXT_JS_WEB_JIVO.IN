'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/shared/public';
import { container, reducedMotion, defaultViewport } from '@/lib/animation-variants';
import type { SunflowerOilsBenefitsContent } from '../types';
import { defaultBenefitsContent } from '../data/defaults';
import { SUNFLOWER_RED, SUNFLOWER_YELLOW } from '../constants';

interface Props {
  data?: SunflowerOilsBenefitsContent;
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
 * Copy column on the left, sunflower artwork on the right. Uses a normal
 * grid (responsive.md §6) rather than absolute positioning, so the two
 * columns stack cleanly on mobile.
 */
export function BenefitsSection({ data }: Props) {
  const { benefitsHeading, benefits, image } = data ?? defaultBenefitsContent;
  const prefersReduced = useReducedMotion();
  const item = prefersReduced ? reducedMotion : textReveal;
  const art = prefersReduced ? reducedMotion : imageReveal;

  return (
    <section
      aria-labelledby="sunflower-benefits-heading"
      className="relative flex w-full flex-col overflow-hidden px-4 pt-8 sm:pt-0 sm:pt-0 pb-0 sm:px-6 lg:block lg:min-h-dvh lg:px-[6%] lg:pb-0 "
      style={{
        backgroundColor: SUNFLOWER_RED,
        ['--sunflower-wheat' as string]: SUNFLOWER_YELLOW,
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
        className="pointer-events-none relative z-0 order-2 mx-auto mt-8 w-[56vw] max-w-72 sm:w-[48vw] sm:max-w-80 md:w-[42vw] md:max-w-96 lg:absolute lg:bottom-0 lg:left-[3%] lg:order-none lg:mx-0 lg:mt-0 lg:w-[30vw] lg:max-w-none"
      >
        {/* SafeImage resolves empty/unknown values to the upload placeholder. */}
        <SafeImage
          src={image}
          alt=""
          width={900}
          height={900}
          quality={85}
          sizes="(max-width: 640px) 62vw, (max-width: 1024px) 50vw, 40vw"
          className="h-auto w-full object-contain object-bottom lg:object-left-bottom"
        />
      </motion.div>

      <motion.div
        variants={prefersReduced ? reducedMotion : container}
        initial="hidden"
        whileInView="show"
        viewport={defaultViewport}
        className="relative z-10 order-1 w-full lg:order-none lg:flex lg:min-h-dvh lg:items-center"
      >
        <div className="grid grid-cols-1 items-start gap-10 lg:ml-auto lg:w-[52%]">
          {/* ── Copy column. The heading and paragraph clear the artwork; the
              benefits list is allowed to run wider (the artwork sits in the
              upper-right, so the lower rows have the full width). ── */}
          <div className="min-w-0">
            <motion.h2
              id="sunflower-benefits-heading"
              variants={item}
              className="font-jost-extrabold text-balance text-[clamp(2rem,1.3rem+3vw,4.25rem)] leading-[1.08] tracking-[0.06em] text-(--sunflower-wheat) uppercase"
            >
              {benefitsHeading}
            </motion.h2>

            {/* No measure cap — each benefit should sit on a single line on
                desktop, so the list is allowed the full copy-column width. */}
            <motion.ul variants={item} className="mt-6 space-y-2.5 lg:mt-8 lg:space-y-3">
              {benefits.map((benefit, i) => (
                <li
                  key={i}
                  className="flex min-w-0 font-jost-light items-start gap-2.5 text-[clamp(1.05rem,0.9rem+0.5vw,1.5rem)] leading-[1.7] text-white"
                >
                  <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-white" />
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

export function BenefitsSectionSkeleton() {
  return (
    <section
      className="relative w-full animate-pulse overflow-hidden px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-14 md:pb-16 lg:flex lg:min-h-dvh lg:items-center lg:px-[6%] lg:py-20 2xl:py-24"
      style={{ backgroundColor: SUNFLOWER_RED }}
    >
      {/* Artwork placeholder — pinned like the real one. */}
      <div className="pointer-events-none relative z-0 order-2 mx-auto mt-8 w-[56vw] max-w-72 sm:w-[48vw] sm:max-w-80 md:w-[42vw] md:max-w-96 lg:absolute lg:bottom-0 lg:left-[3%] lg:order-none lg:mx-0 lg:mt-0 lg:w-[30vw] lg:max-w-none">
        <div className="aspect-square w-full bg-white/10" />
      </div>

      <div className="relative z-10 order-1 w-full lg:order-none lg:flex lg:min-h-dvh lg:items-center">
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
